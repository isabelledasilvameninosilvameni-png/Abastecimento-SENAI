import React, { useState } from 'react';
import { Material } from '../../types';
import { Search, Filter, QrCode, Boxes, MapPin, AlertCircle, CheckCircle2, Edit3, Save, X } from 'lucide-react';

interface StockManagementViewProps {
  materials: Material[];
  onOpenScanner: () => void;
  onUpdateMaterial: (updated: Material) => void;
}

export const StockManagementView: React.FC<StockManagementViewProps> = ({
  materials,
  onOpenScanner,
  onUpdateMaterial
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [corredorFilter, setCorredorFilter] = useState('ALL');
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editSaldo, setEditSaldo] = useState<number>(0);

  const filteredMaterials = materials.filter(m => {
    const matchSearch = 
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.localizacao.codigoCompleto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCorredor = corredorFilter === 'ALL' || m.localizacao.corredor === corredorFilter;

    return matchSearch && matchCorredor;
  });

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
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Gestão de Estoque & Localização Física (WMS / Almoxarifado)
          </h2>
          <p className="text-xs text-slate-500">
            Endereçamento físico de materiais (Corredor, Rua, Prateleira e Nível) e controle de saldos em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="stock-scan-btn"
            onClick={onOpenScanner}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            Escanear Código / Prateleira
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            id="stock-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por SKU, descrição do material ou endereço (ex: ALM-A)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

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
      </div>

      {/* Materials Inventory Grid */}
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
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMaterialId(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
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
                          title="Ajustar Saldo"
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

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Lote Padrão: <strong className="font-mono">{mat.lotePadrao}</strong></span>
                <span className="font-mono text-slate-400 text-[10px] truncate max-w-[120px]">
                  QR: {mat.qrCodeValor}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
