import React, { useState } from 'react';
import { ProductionLine, Material, UrgencyLevel, User } from '../../types';
import { X, Save, AlertTriangle, QrCode, Clock, Box } from 'lucide-react';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  lines: ProductionLine[];
  materials: Material[];
  onSaveRequest: (newReqData: {
    linhaId: string;
    linhaNome: string;
    postoId: string;
    postoNome: string;
    materialId: string;
    materialCodigo: string;
    materialDescricao: string;
    unidadeMedida: string;
    quantidade: number;
    urgencia: UrgencyLevel;
    observacao?: string;
  }) => void;
  onOpenScanner: (target: 'MATERIAL' | 'POSTO') => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lines,
  materials,
  onSaveRequest,
  onOpenScanner
}) => {
  const [selectedLineId, setSelectedLineId] = useState<string>(lines[0]?.id || '');
  const [selectedPostoId, setSelectedPostoId] = useState<string>(lines[0]?.postos[0]?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [urgencia, setUrgencia] = useState<UrgencyLevel>('NORMAL');
  const [observacao, setObservacao] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentLine = lines.find(l => l.id === selectedLineId) || lines[0];
  const postos = currentLine?.postos || [];
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedLineId || !selectedPostoId) {
      setErrorMsg('Selecione a Linha de Produção e o Posto de Trabalho.');
      return;
    }
    if (!selectedMaterial) {
      setErrorMsg('Selecione um material válido.');
      return;
    }
    if (quantidade <= 0) {
      setErrorMsg('A quantidade solicitada deve ser maior que zero.');
      return;
    }
    if (quantidade > selectedMaterial.saldoAtual) {
      setErrorMsg(`Atenção: Quantidade solicitada (${quantidade}) excede o saldo físico disponível no almoxarifado (${selectedMaterial.saldoAtual} ${selectedMaterial.unidadeMedida}).`);
      return;
    }

    const currentPosto = postos.find(p => p.id === selectedPostoId) || postos[0];

    onSaveRequest({
      linhaId: currentLine.id,
      linhaNome: currentLine.nome,
      postoId: currentPosto.id,
      postoNome: currentPosto.nome,
      materialId: selectedMaterial.id,
      materialCodigo: selectedMaterial.codigo,
      materialDescricao: selectedMaterial.descricao,
      unidadeMedida: selectedMaterial.unidadeMedida,
      quantidade: Number(quantidade),
      urgencia,
      observacao: observacao.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        id="new-request-modal-card"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Nova Solicitação de Abastecimento</h3>
              <p className="text-xs text-slate-300">Solicitante: {currentUser.name} ({currentUser.roleLabel})</p>
            </div>
          </div>
          <button
            id="close-new-request-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Destino: Linha e Posto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Linha de Produção <span className="text-red-500">*</span>
              </label>
              <select
                id="select-linha"
                value={selectedLineId}
                onChange={(e) => {
                  setSelectedLineId(e.target.value);
                  const newLine = lines.find(l => l.id === e.target.value);
                  if (newLine && newLine.postos.length > 0) {
                    setSelectedPostoId(newLine.postos[0].id);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-800"
              >
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Posto de Trabalho (Consumo) <span className="text-red-500">*</span>
              </label>
              <select
                id="select-posto"
                value={selectedPostoId}
                onChange={(e) => setSelectedPostoId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-800"
              >
                {postos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Componente / Material */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Material / Componente Requisitado <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                id="scan-material-btn"
                onClick={() => onOpenScanner('MATERIAL')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                Escanear Código / Kanban
              </button>
            </div>
            <select
              id="select-material"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.codigo}] {m.descricao} — Saldo: {m.saldoAtual} {m.unidadeMedida}
                </option>
              ))}
            </select>

            {/* Informações de Estoque do Material Selecionado */}
            {selectedMaterial && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">Endereço no Almoxarifado:</span>{' '}
                  <span className="font-mono text-blue-700 font-bold">{selectedMaterial.localizacao.codigoCompleto}</span>{' '}
                  (Corredor {selectedMaterial.localizacao.corredor}, Prateleira {selectedMaterial.localizacao.prateleira})
                </div>
                <div className="flex items-center gap-3">
                  <span>Saldo Atual: <strong className="text-emerald-700 font-bold">{selectedMaterial.saldoAtual} {selectedMaterial.unidadeMedida}</strong></span>
                  <span>Estoque Mínimo: <strong>{selectedMaterial.estoqueMinimo}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantidade Necessária ({selectedMaterial?.unidadeMedida || 'UN'}) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="input-quantidade"
                min={1}
                max={selectedMaterial?.saldoAtual || 100}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-36 px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
              />
              <div className="flex gap-1.5">
                {[1, 2, 5, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantidade(val)}
                    className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nível de Urgência */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Grau de Urgência & SLA Operacional <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label 
                className={`flex flex-col p-2.5 border rounded-xl cursor-pointer transition-all ${
                  urgencia === 'NORMAL' 
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="urgencia"
                  checked={urgencia === 'NORMAL'}
                  onChange={() => setUrgencia('NORMAL')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-blue-900">Normal</span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> SLA: 30 min
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Reposição rotineira de turno</span>
              </label>

              <label 
                className={`flex flex-col p-2.5 border rounded-xl cursor-pointer transition-all ${
                  urgencia === 'URGENTE' 
                    ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="urgencia"
                  checked={urgencia === 'URGENTE'}
                  onChange={() => setUrgencia('URGENTE')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-amber-900">Urgente</span>
                <span className="text-[11px] text-amber-700 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> SLA: 15 min
                </span>
                <span className="text-[10px] text-amber-600/80 mt-0.5">Estoque de posto acabando</span>
              </label>

              <label 
                className={`flex flex-col p-2.5 border rounded-xl cursor-pointer transition-all ${
                  urgencia === 'CRITICO_LINHA_PARADA' 
                    ? 'bg-red-50/90 border-red-500 ring-2 ring-red-400/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="urgencia"
                  checked={urgencia === 'CRITICO_LINHA_PARADA'}
                  onChange={() => setUrgencia('CRITICO_LINHA_PARADA')}
                  className="sr-only"
                />
                <span className="text-xs font-bold text-red-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  Crítico
                </span>
                <span className="text-[11px] text-red-700 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> SLA: 5 min
                </span>
                <span className="text-[10px] text-red-600/80 mt-0.5">Linha Parada / Andon</span>
              </label>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações / Instruções de Entrega (Opcional)
            </label>
            <textarea
              id="input-observacao"
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Entregar na caixa amarela de Kanban; batelada especial..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-request-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="save-request-btn"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              Salvar Solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
