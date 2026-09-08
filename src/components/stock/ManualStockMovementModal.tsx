import React, { useState, useEffect } from 'react';
import { Material, StockMovement, StockMovementType, User } from '../../types';
import { 
  X, 
  Save, 
  ArrowUpRight, 
  ArrowDownRight, 
  SlidersHorizontal, 
  AlertCircle, 
  CheckCircle2, 
  Boxes, 
  PackagePlus, 
  FileText, 
  Tag, 
  AlertTriangle 
} from 'lucide-react';

interface ManualStockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  selectedMaterialId?: string | null;
  currentUser: User;
  onConfirmMovement: (movement: {
    materialId: string;
    tipo: StockMovementType;
    natureza: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
    tipoLabel: string;
    quantidade: number;
    saldoAnterior: number;
    saldoNovo: number;
    lote?: string;
    documentoRef?: string;
    motivo: string;
  }) => void;
}

export const ManualStockMovementModal: React.FC<ManualStockMovementModalProps> = ({
  isOpen,
  onClose,
  materials,
  selectedMaterialId,
  currentUser,
  onConfirmMovement
}) => {
  const [materialId, setMaterialId] = useState<string>('');
  const [natureza, setNatureza] = useState<'ENTRADA' | 'SAIDA' | 'AJUSTE'>('ENTRADA');
  const [tipo, setTipo] = useState<StockMovementType>('ENTRADA_COMPRA');
  const [quantidade, setQuantidade] = useState<number>(10);
  const [novoSaldoAjuste, setNovoSaldoAjuste] = useState<number>(0);
  const [lote, setLote] = useState<string>('');
  const [documentoRef, setDocumentoRef] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set initial material and lote
  useEffect(() => {
    if (selectedMaterialId) {
      setMaterialId(selectedMaterialId);
    } else if (materials.length > 0 && !materialId) {
      setMaterialId(materials[0].id);
    }
  }, [selectedMaterialId, materials]);

  const activeMaterial = materials.find(m => m.id === materialId) || materials[0];

  useEffect(() => {
    if (activeMaterial) {
      setLote(activeMaterial.lotePadrao || '');
      setNovoSaldoAjuste(activeMaterial.saldoAtual);
    }
  }, [activeMaterial]);

  if (!isOpen || !activeMaterial) return null;

  // Calculate projected new balance
  let saldoNovo = activeMaterial.saldoAtual;
  let quantidadeMovimentada = quantidade;

  if (natureza === 'ENTRADA') {
    saldoNovo = activeMaterial.saldoAtual + Math.max(0, quantidade);
    quantidadeMovimentada = Math.max(0, quantidade);
  } else if (natureza === 'SAIDA') {
    saldoNovo = Math.max(0, activeMaterial.saldoAtual - Math.max(0, quantidade));
    quantidadeMovimentada = Math.max(0, quantidade);
  } else {
    saldoNovo = Math.max(0, novoSaldoAjuste);
    quantidadeMovimentada = Math.abs(saldoNovo - activeMaterial.saldoAtual);
  }

  const isLowStockWarning = saldoNovo <= activeMaterial.estoqueMinimo;
  const isZeroStock = saldoNovo === 0;

  const handleNaturezaChange = (newNat: 'ENTRADA' | 'SAIDA' | 'AJUSTE') => {
    setNatureza(newNat);
    setErrorMsg(null);
    if (newNat === 'ENTRADA') {
      setTipo('ENTRADA_COMPRA');
    } else if (newNat === 'SAIDA') {
      setTipo('SAIDA_MANUAL');
    } else {
      setTipo('AJUSTE_INVENTARIO');
      setNovoSaldoAjuste(activeMaterial.saldoAtual);
    }
  };

  const getTipoLabel = (t: StockMovementType): string => {
    switch (t) {
      case 'ENTRADA_COMPRA': return 'Entrada por Compra / Recebimento de Fornecedor';
      case 'ENTRADA_DEVOLUCAO': return 'Entrada por Devolução da Linha de Produção';
      case 'ENTRADA_AVULSA': return 'Entrada Avulsa / Bonificação / Amostra';
      case 'SAIDA_AVARIA': return 'Saída por Avaria / Danificado no Manuseio';
      case 'SAIDA_DESCARTE': return 'Saída por Descarte / Sucata / Validade';
      case 'SAIDA_MANUAL': return 'Baixa Manual / Consumo Extra';
      case 'AJUSTE_INVENTARIO': return 'Ajuste de Balanço / Inventário Cíclico';
      default: return t;
    }
  };

  const handleApplyQuickReason = (text: string) => {
    setMotivo(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!motivo.trim()) {
      setErrorMsg('Por favor, informe a justificativa ou motivo do lançamento manual.');
      return;
    }

    if (natureza !== 'AJUSTE' && (quantidade <= 0 || isNaN(quantidade))) {
      setErrorMsg('A quantidade a movimentar deve ser maior que zero.');
      return;
    }

    if (natureza === 'SAIDA' && quantidade > activeMaterial.saldoAtual) {
      setErrorMsg(`Quantidade de saída (${quantidade}) excede o saldo atual disponível (${activeMaterial.saldoAtual} ${activeMaterial.unidadeMedida}).`);
      return;
    }

    if (natureza === 'AJUSTE' && (novoSaldoAjuste < 0 || isNaN(novoSaldoAjuste))) {
      setErrorMsg('O novo saldo do inventário não pode ser negativo.');
      return;
    }

    onConfirmMovement({
      materialId: activeMaterial.id,
      tipo,
      natureza,
      tipoLabel: getTipoLabel(tipo),
      quantidade: quantidadeMovimentada,
      saldoAnterior: activeMaterial.saldoAtual,
      saldoNovo,
      lote: lote.trim() || undefined,
      documentoRef: documentoRef.trim() || undefined,
      motivo: motivo.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="manual-stock-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Lançar Estoque Manual
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  WMS Almoxarifado
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro auditado de entrada, saída ou ajuste de inventário com atualização de saldo em tempo real.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar Janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Seleção do Material */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>1. Selecione o Material / SKU</span>
              <span className="text-[11px] font-normal text-slate-500">
                {materials.length} itens cadastrados
              </span>
            </label>
            <select
              id="movement-material-select"
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.codigo} - {m.descricao} (Saldo Atual: {m.saldoAtual} {m.unidadeMedida})
                </option>
              ))}
            </select>

            {/* Resumo do Material Selecionado */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Código</span>
                <span className="font-mono font-bold text-blue-700">{activeMaterial.codigo}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Endereço WMS</span>
                <span className="font-mono font-semibold text-slate-700">{activeMaterial.localizacao.codigoCompleto}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Saldo Atual</span>
                <span className="font-bold text-slate-900">{activeMaterial.saldoAtual} {activeMaterial.unidadeMedida}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Estoque Mínimo</span>
                <span className="font-semibold text-slate-600">{activeMaterial.estoqueMinimo} {activeMaterial.unidadeMedida}</span>
              </div>
            </div>
          </div>

          {/* 2. Natureza da Operação */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              2. Natureza da Movimentação
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                id="natureza-entrada-btn"
                onClick={() => handleNaturezaChange('ENTRADA')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                  natureza === 'ENTRADA'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Entrada (+)</span>
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Recebimento de fornecedor, compra ou devolução
                </span>
              </button>

              <button
                type="button"
                id="natureza-saida-btn"
                onClick={() => handleNaturezaChange('SAIDA')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                  natureza === 'SAIDA'
                    ? 'border-red-600 bg-red-50/70 text-red-900 ring-2 ring-red-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-red-700">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Saída (-)</span>
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Avaria, sucata, descarte ou consumo manual
                </span>
              </button>

              <button
                type="button"
                id="natureza-ajuste-btn"
                onClick={() => handleNaturezaChange('AJUSTE')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                  natureza === 'AJUSTE'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Ajuste (=)</span>
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Balanço físico ou contagem de inventário cíclico
                </span>
              </button>
            </div>
          </div>

          {/* Subtipo de Movimento */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Tipo Específico de Operação:
            </label>
            <select
              id="movement-subtype-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as StockMovementType)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {natureza === 'ENTRADA' && (
                <>
                  <option value="ENTRADA_COMPRA">Entrada por Compra / Recebimento de Fornecedor</option>
                  <option value="ENTRADA_DEVOLUCAO">Entrada por Devolução da Linha de Produção</option>
                  <option value="ENTRADA_AVULSA">Entrada Avulsa / Bonificação / Teste de Engenharia</option>
                </>
              )}
              {natureza === 'SAIDA' && (
                <>
                  <option value="SAIDA_AVARIA">Saída por Avaria / Danificado no Manuseio</option>
                  <option value="SAIDA_DESCARTE">Saída por Descarte / Sucata / Obsoleto</option>
                  <option value="SAIDA_MANUAL">Baixa Manual / Consumo Extraordinário</option>
                </>
              )}
              {natureza === 'AJUSTE' && (
                <option value="AJUSTE_INVENTARIO">Ajuste de Balanço / Inventário Físico Cíclico</option>
              )}
            </select>
          </div>

          {/* 3. Quantidade e Simulador de Saldo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {natureza === 'AJUSTE' ? 'Novo Saldo Apurado na Contagem:' : 'Quantidade a Movimentar:'}
              </label>
              <div className="flex items-center gap-2">
                {natureza === 'AJUSTE' ? (
                  <input
                    type="number"
                    id="movement-new-balance-input"
                    min={0}
                    value={novoSaldoAjuste}
                    onChange={(e) => setNovoSaldoAjuste(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                ) : (
                  <input
                    type="number"
                    id="movement-quantity-input"
                    min={1}
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                )}
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 shrink-0">
                  {activeMaterial.unidadeMedida}
                </span>
              </div>
            </div>

            {/* Simulador Visual do Impacto */}
            <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                <span>Simulação do Saldo</span>
                {natureza === 'ENTRADA' && <span className="text-emerald-400 font-bold">+ Aumento</span>}
                {natureza === 'SAIDA' && <span className="text-red-400 font-bold">- Redução</span>}
                {natureza === 'AJUSTE' && <span className="text-blue-400 font-bold">= Reajuste</span>}
              </span>

              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-300">Saldo Anterior:</span>
                <strong className="text-white">{activeMaterial.saldoAtual} {activeMaterial.unidadeMedida}</strong>
              </div>

              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-300">Lançamento:</span>
                <strong className={
                  natureza === 'ENTRADA' ? 'text-emerald-400' : natureza === 'SAIDA' ? 'text-red-400' : 'text-blue-400'
                }>
                  {natureza === 'ENTRADA' ? `+${quantidade}` : natureza === 'SAIDA' ? `-${quantidade}` : `Ajuste (${saldoNovo - activeMaterial.saldoAtual >= 0 ? '+' : ''}${saldoNovo - activeMaterial.saldoAtual})`} {activeMaterial.unidadeMedida}
                </strong>
              </div>

              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Novo Saldo Previsto:</span>
                <span className="font-mono text-sm font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {saldoNovo} {activeMaterial.unidadeMedida}
                </span>
              </div>

              {isLowStockWarning && (
                <div className="pt-1 text-[11px] text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Atenção: Saldo previsto ficará no nível crítico ou abaixo do mínimo ({activeMaterial.estoqueMinimo}).</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Lote e Documento de Referência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                Lote de Controle / Batch:
              </label>
              <input
                type="text"
                id="movement-lote-input"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                placeholder="Ex: LOT-2026-F88"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                Documento / NF / OP de Referência:
              </label>
              <input
                type="text"
                id="movement-doc-input"
                value={documentoRef}
                onChange={(e) => setDocumentoRef(e.target.value)}
                placeholder="Ex: NF-004921 ou OP-2026-08"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* 5. Motivo / Justificativa com Sugestões Rápidas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>5. Motivo / Justificativa do Lançamento:</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Obrigatório para rastreabilidade</span>
            </div>
            
            <textarea
              id="movement-motivo-textarea"
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva a razão deste lançamento manual (ex: Recebimento de compra, avaria no transporte, contagem física periódica)..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Sugestões rápidas */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className="text-slate-400 text-[10px] font-medium">Sugestões:</span>
              {natureza === 'ENTRADA' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickReason('Recebimento de lote programado com nota fiscal de fornecedor')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Recebimento de NF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickReason('Devolução de sobra de montagem da Linha de Produção')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Devolução de Linha
                  </button>
                </>
              )}
              {natureza === 'SAIDA' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickReason('Material danificado/avariado durante movimentação de empilhadeira')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Avaria no manuseio
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickReason('Descarte por não conformidade ou expiração de validade')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Descarte / Sucata
                  </button>
                </>
              )}
              {natureza === 'AJUSTE' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickReason('Contagem cíclica física identificou divergência de saldo no endereço')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Contagem física cíclica
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickReason('Correção de saldo de inventário auditado')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Correção auditada
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Rodapé de Identificação do Responsável */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Operador Responsável: <strong className="text-slate-900">{currentUser.name}</strong></span>
              <span className="font-mono text-slate-500">({currentUser.badgeNumber})</span>
            </div>
            <span className="text-[11px] text-slate-400">Timestamp: Em tempo real</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="confirm-stock-movement-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Confirmar Lançamento de Estoque
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
