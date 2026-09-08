import React, { useState } from 'react';
import { Material, StockMovement, StockMovementType, User } from '../../types';
import { 
  Search, 
  Filter, 
  QrCode, 
  Boxes, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Save, 
  X, 
  PackagePlus, 
  ArrowUpRight, 
  ArrowDownRight, 
  SlidersHorizontal, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  History
} from 'lucide-react';
import { ManualStockMovementModal } from './ManualStockMovementModal';

interface StockManagementViewProps {
  materials: Material[];
  stockMovements: StockMovement[];
  currentUser: User;
  onOpenScanner: () => void;
  onUpdateMaterial: (updated: Material) => void;
  onAddStockMovement: (movement: {
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

export const StockManagementView: React.FC<StockManagementViewProps> = ({
  materials,
  stockMovements,
  currentUser,
  onOpenScanner,
  onUpdateMaterial,
  onAddStockMovement
}) => {
  const [subTab, setSubTab] = useState<'POSICAO' | 'EXTRATO'>('POSICAO');
  const [searchTerm, setSearchTerm] = useState('');
  const [corredorFilter, setCorredorFilter] = useState('ALL');
  const [naturezaFilter, setNaturezaFilter] = useState<'ALL' | 'ENTRADA' | 'SAIDA' | 'AJUSTE'>('ALL');
  
  // Quick inline edit
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editSaldo, setEditSaldo] = useState<number>(0);

  // Manual movement modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedMaterialIdForModal, setSelectedMaterialIdForModal] = useState<string | null>(null);

  // Filtered materials
  const filteredMaterials = materials.filter(m => {
    const matchSearch = 
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.localizacao.codigoCompleto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCorredor = corredorFilter === 'ALL' || m.localizacao.corredor === corredorFilter;

    return matchSearch && matchCorredor;
  });

  // Filtered movements
  const filteredMovements = stockMovements.filter(mov => {
    const matchSearch = 
      mov.materialCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.materialDescricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mov.lote && mov.lote.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mov.documentoRef && mov.documentoRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mov.motivo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchNatureza = naturezaFilter === 'ALL' || mov.natureza === naturezaFilter;

    return matchSearch && matchNatureza;
  });

  // Statistics
  const totalCriticos = materials.filter(m => m.saldoAtual <= m.estoqueMinimo).length;
  const totalEntradas = stockMovements.filter(m => m.natureza === 'ENTRADA').length;
  const totalSaidas = stockMovements.filter(m => m.natureza === 'SAIDA').length;

  const handleOpenManualEntry = (matId?: string) => {
    setSelectedMaterialIdForModal(matId || null);
    setIsManualModalOpen(true);
  };

  const handleStartEdit = (m: Material) => {
    setEditingMaterialId(m.id);
    setEditSaldo(m.saldoAtual);
  };

  const handleSaveEdit = (m: Material) => {
    onUpdateMaterial({
      ...m,
      saldoAtual: editSaldo
    });
    setEditingMaterialId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with Prominent Manual Stock Button */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Gestão de Estoque & Localização Física (WMS / Almoxarifado)
          </h2>
          <p className="text-xs text-slate-500">
            Endereçamento físico de materiais, contagem de inventário e lançamentos manuais com rastreabilidade contínua.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action: Lançar Estoque Manual */}
          <button
            type="button"
            id="btn-lancar-estoque-manual"
            onClick={() => handleOpenManualEntry()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Registrar entrada, saída avulsa ou ajuste de inventário manual"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Lançar Estoque Manual</span>
          </button>

          {/* Scanner shortcut */}
          <button
            type="button"
            id="stock-scan-btn"
            onClick={onOpenScanner}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs border border-slate-700"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Escanear Código</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total de SKUs Ativos</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-slate-900 font-mono">{materials.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">Cadastrados</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Itens em Alerta Crítico</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-lg font-black font-mono ${totalCriticos > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {totalCriticos}
            </span>
            <span className="text-[10px] text-red-600 font-bold">≤ Estoque Mínimo</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Entradas Manuais Hoje</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-emerald-600 font-mono">{totalEntradas}</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Recebimentos
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Saídas & Descartes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-amber-600 font-mono">{totalSaidas}</span>
            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> Avarias/Perdas
            </span>
          </div>
        </div>
      </div>

      {/* Subtabs Selector: Posição de Estoque vs Extrato de Movimentações */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="subtab-posicao-estoque"
            onClick={() => setSubTab('POSICAO')}
            className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              subTab === 'POSICAO'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Posição de Estoque & Endereçamento ({filteredMaterials.length})</span>
          </button>

          <button
            type="button"
            id="subtab-extrato-movimentos"
            onClick={() => setSubTab('EXTRATO')}
            className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              subTab === 'EXTRATO'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Extrato de Movimentações / Kardex ({stockMovements.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Operador Ativo: <strong className="text-slate-600">{currentUser.name}</strong>
        </span>
      </div>

      {/* Search and Contextual Filters */}
      <div className="bg-white p-3 rounded-b-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 -mt-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            id="stock-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              subTab === 'POSICAO'
                ? "Pesquisar por SKU, descrição do material ou endereço (ex: ALM-A)..."
                : "Pesquisar movimentações por SKU, lote, nota fiscal ou motivo..."
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Filters according to active subTab */}
        {subTab === 'POSICAO' ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Corredor:
            </span>
            {['ALL', 'A', 'B', 'C'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCorredorFilter(c)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  corredorFilter === c
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {c === 'ALL' ? 'Todos' : `Corredor ${c}`}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Operação:
            </span>
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'ENTRADA', label: 'Entradas (+)' },
              { id: 'SAIDA', label: 'Saídas (-)' },
              { id: 'AJUSTE', label: 'Ajustes (=)' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setNaturezaFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  naturezaFilter === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: POSIÇÃO DE ESTOQUE (INVENTÁRIO) */}
      {subTab === 'POSICAO' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMaterials.map((mat) => {
            const isCritical = mat.saldoAtual <= mat.estoqueMinimo;
            const isEditing = editingMaterialId === mat.id;

            return (
              <div
                key={mat.id}
                id={`material-card-${mat.id}`}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-700">{mat.codigo}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug mt-0.5">{mat.descricao}</h4>
                      <span className="text-[10px] text-slate-400">{mat.categoria}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      isCritical 
                        ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isCritical ? 'Estoque Baixo' : 'Disponível'}
                    </span>
                  </div>

                  {/* Location Badge */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Endereço Físico no Almoxarifado:</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-800">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-blue-800">
                        {mat.localizacao.codigoCompleto}
                      </span>
                      <span className="text-slate-500">
                        Rua {mat.localizacao.rua} • Prateleira {mat.localizacao.prateleira} • {mat.localizacao.nivel}
                      </span>
                    </div>
                  </div>

                  {/* Saldo and Minimum indicator */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Saldo em Estoque:</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editSaldo}
                            onChange={(e) => setEditSaldo(Number(e.target.value))}
                            className="w-20 px-2 py-0.5 text-xs font-bold border rounded focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(mat)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Salvar Saldo"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMaterialId(null)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                            title="Cancelar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <strong className="font-mono text-sm text-slate-900 font-extrabold">
                            {mat.saldoAtual} {mat.unidadeMedida}
                          </strong>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(mat)}
                            title="Ajuste Rápido de Saldo"
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Estoque Mínimo: {mat.estoqueMinimo} {mat.unidadeMedida}</span>
                      <span>Segurança: {mat.estoqueSeguranca}</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(100, (mat.saldoAtual / (mat.estoqueMinimo * 2)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer and Direct Action for Manual Movement */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Lote: <strong className="font-mono">{mat.lotePadrao || 'N/D'}</strong></span>
                    <span className="font-mono text-slate-400 text-[10px] truncate max-w-[120px]">
                      QR: {mat.qrCodeValor}
                    </span>
                  </div>

                  {/* Direct Launch Button for this Material */}
                  <button
                    type="button"
                    id={`btn-lancar-material-${mat.id}`}
                    onClick={() => handleOpenManualEntry(mat.id)}
                    className="w-full py-1.5 px-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PackagePlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lançar Movimento Neste Item</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: EXTRATO DE MOVIMENTAÇÕES (KARDEX / HISTÓRICO) */}
      {subTab === 'EXTRATO' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-600" />
              Histórico Cronológico de Lançamentos Manuais de Estoque
            </span>
            <button
              type="button"
              onClick={() => handleOpenManualEntry()}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              Novo Lançamento
            </button>
          </div>

          {filteredMovements.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Boxes className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Nenhum lançamento encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Tipo de Movimento</th>
                    <th className="py-2.5 px-3">Material / SKU</th>
                    <th className="py-2.5 px-3 text-right">Quantidade</th>
                    <th className="py-2.5 px-3 text-center">Saldo Anterior ➔ Novo</th>
                    <th className="py-2.5 px-3">Lote / Doc</th>
                    <th className="py-2.5 px-3">Motivo / Justificativa</th>
                    <th className="py-2.5 px-3">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMovements.map((mov) => {
                    const isEntrada = mov.natureza === 'ENTRADA';
                    const isSaida = mov.natureza === 'SAIDA';
                    const isAjuste = mov.natureza === 'AJUSTE';

                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {mov.dataHora}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isEntrada 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isSaida
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {isEntrada && <ArrowUpRight className="w-3 h-3" />}
                            {isSaida && <ArrowDownRight className="w-3 h-3" />}
                            {isAjuste && <SlidersHorizontal className="w-3 h-3" />}
                            {mov.tipoLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-blue-700">{mov.materialCodigo}</div>
                          <div className="text-[11px] text-slate-600 truncate max-w-[180px]">{mov.materialDescricao}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-extrabold whitespace-nowrap">
                          <span className={isEntrada ? 'text-emerald-700' : isSaida ? 'text-red-700' : 'text-blue-700'}>
                            {isEntrada ? '+' : isSaida ? '-' : ''}{mov.quantidade} {mov.unidadeMedida}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="text-slate-500">{mov.saldoAnterior}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <strong className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {mov.saldoNovo}
                            </strong>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          <div>{mov.lote || <span className="text-slate-400">-</span>}</div>
                          {mov.documentoRef && (
                            <span className="text-[10px] text-slate-500 block">{mov.documentoRef}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-[220px]">
                          <p className="text-[11px] leading-tight line-clamp-2" title={mov.motivo}>
                            {mov.motivo}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{mov.responsavelNome}</div>
                          <div className="text-[10px] text-slate-400">{mov.responsavelPerfil}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manual Stock Movement Modal */}
      <ManualStockMovementModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setSelectedMaterialIdForModal(null);
        }}
        materials={materials}
        selectedMaterialId={selectedMaterialIdForModal}
        currentUser={currentUser}
        onConfirmMovement={(movement) => {
          onAddStockMovement(movement);
        }}
      />
    </div>
  );
};
