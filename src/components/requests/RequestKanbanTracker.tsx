import React, { useState } from 'react';
import { MaterialRequest, User, RequestStatus } from '../../types';
import { 
  Clock, 
  MapPin, 
  User as UserIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Truck, 
  CheckSquare, 
  QrCode, 
  Filter, 
  Search, 
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Eye
} from 'lucide-react';

interface RequestKanbanTrackerProps {
  requests: MaterialRequest[];
  currentUser: User;
  onAcceptRequest: (reqId: string) => void;
  onStartTransport: (reqId: string) => void;
  onConfirmDelivery: (reqId: string) => void;
  onFinalizeRequest: (reqId: string) => void;
  onOpenProblemModal: (req: MaterialRequest) => void;
  onOpenScannerForRequest: (req: MaterialRequest) => void;
  onSelectRequestDetails: (req: MaterialRequest) => void;
  onOpenNewRequestModal: () => void;
}

const STAGES: { key: RequestStatus; label: string; stepNumber: number; color: string; border: string; bg: string }[] = [
  { key: 'SOLICITADO', label: '1. Produção Solicita', stepNumber: 1, color: 'text-blue-700', border: 'border-blue-300', bg: 'bg-blue-50' },
  { key: 'RECEBIDO_ESTOQUE', label: '2. Estoque Recebe', stepNumber: 2, color: 'text-indigo-700', border: 'border-indigo-300', bg: 'bg-indigo-50' },
  { key: 'MATERIAL_SEPARADO', label: '3. Material Separado', stepNumber: 3, color: 'text-amber-700', border: 'border-amber-300', bg: 'bg-amber-50' },
  { key: 'EM_TRANSPORTE', label: '4. Abastecedor Transporta', stepNumber: 4, color: 'text-purple-700', border: 'border-purple-300', bg: 'bg-purple-50' },
  { key: 'ENTREGA_REALIZADA', label: '5. Entrega Realizada', stepNumber: 5, color: 'text-cyan-700', border: 'border-cyan-300', bg: 'bg-cyan-50' },
  { key: 'FINALIZADA', label: '6. Produção Confirma', stepNumber: 6, color: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50' }
];

export const RequestKanbanTracker: React.FC<RequestKanbanTrackerProps> = ({
  requests,
  currentUser,
  onAcceptRequest,
  onStartTransport,
  onConfirmDelivery,
  onFinalizeRequest,
  onOpenProblemModal,
  onOpenScannerForRequest,
  onSelectRequestDetails,
  onOpenNewRequestModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICO' | 'URGENTE' | 'NORMAL'>('ALL');
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('ALL');

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchSearch = 
      req.numeroOrdem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.materialCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.materialDescricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.postoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.linhaNome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchUrgency = 
      urgencyFilter === 'ALL' ||
      (urgencyFilter === 'CRITICO' && req.urgencia === 'CRITICO_LINHA_PARADA') ||
      (urgencyFilter === 'URGENTE' && req.urgencia === 'URGENTE') ||
      (urgencyFilter === 'NORMAL' && req.urgencia === 'NORMAL');

    const matchLine = 
      selectedLineFilter === 'ALL' || req.linhaId === selectedLineFilter;

    return matchSearch && matchUrgency && matchLine;
  });

  const getUrgencyBadge = (urgencia: MaterialRequest['urgencia']) => {
    switch (urgencia) {
      case 'CRITICO_LINHA_PARADA':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-300 flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-3 h-3" /> Linha Parada (5m)
          </span>
        );
      case 'URGENTE':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Urgente (15m)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Normal (30m)
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Pipeline Header Indicator */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Fluxo Contínuo de Abastecimento em Tempo Real
            </h2>
            <p className="text-xs text-slate-500">
              Rastreamento ponta a ponta: <strong>O que</strong> precisa ser abastecido, <strong>Onde</strong> está, <strong>Quem</strong> transporta e <strong>Se a produção recebeu</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="tracker-new-request-btn"
              onClick={onOpenNewRequestModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              + Nova Solicitação
            </button>
          </div>
        </div>

        {/* 6-Stage Visual Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {STAGES.map((stg) => {
            const count = requests.filter(r => r.status === stg.key).length;
            return (
              <div 
                key={stg.key}
                className={`p-2.5 rounded-lg border ${stg.border} ${stg.bg} flex flex-col justify-between transition-all`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${stg.color}`}>
                    {stg.label}
                  </span>
                  <span className={`text-xs font-extrabold px-1.5 py-0.2 rounded-full ${count > 0 ? 'bg-white shadow-2xs font-mono' : 'text-slate-400'}`}>
                    {count}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Passo {stg.stepNumber} de 6</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            id="tracker-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nº ordem, código do material, posto..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Urgência:</span>
          </div>
          <div className="flex gap-1">
            {(['ALL', 'CRITICO', 'URGENTE', 'NORMAL'] as const).map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setUrgencyFilter(u)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  urgencyFilter === u 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {u === 'ALL' ? 'Todos' : u === 'CRITICO' ? 'Crítico' : u === 'URGENTE' ? 'Urgente' : 'Normal'}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <select
            id="filter-line-select"
            value={selectedLineFilter}
            onChange={(e) => setSelectedLineFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Todas as Linhas</option>
            <option value="lin-01">Linha 1 - Chassi</option>
            <option value="lin-02">Linha 2 - Eletrônica</option>
            <option value="lin-03">Linha 3 - Usinagem</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3.5">
        {STAGES.map((stage) => {
          const stageRequests = filteredRequests.filter(r => r.status === stage.key);

          return (
            <div 
              key={stage.key}
              id={`kanban-col-${stage.key.toLowerCase()}`}
              className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/90 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">{stage.label}</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {stageRequests.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {stageRequests.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-center text-slate-400 text-xs italic">
                    Nenhuma ordem nesta etapa
                  </div>
                ) : (
                  stageRequests.map((req) => (
                    <div
                      key={req.id}
                      id={`request-card-${req.id}`}
                      className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Card Info: Order & Urgency */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="font-mono text-xs font-extrabold text-blue-700">
                            {req.numeroOrdem}
                          </span>
                          {getUrgencyBadge(req.urgencia)}
                        </div>

                        {/* O que precisa ser abastecido */}
                        <div className="mb-2.5 pb-2 border-b border-slate-100">
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {req.materialDescricao}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-500 text-[11px]">SKU: {req.materialCodigo}</span>
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                              Qtd: {req.quantidadeSolicitada} {req.unidadeMedida}
                            </span>
                          </div>
                          {req.loteSeparado && (
                            <div className="mt-1 text-[11px] text-slate-600 font-medium">
                              Lote: <strong className="font-mono text-indigo-700">{req.loteSeparado}</strong>
                            </div>
                          )}
                        </div>

                        {/* Onde está o material */}
                        <div className="space-y-1 text-xs text-slate-600 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">
                              <strong>Destino:</strong> {req.postoNome} ({req.linhaNome})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Aberto em: {new Date(req.dataCriacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {/* Quem está realizando */}
                        <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 flex items-center justify-between gap-1 mb-3">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {req.status === 'SOLICITADO' && `Op: ${req.solicitanteNome}`}
                              {req.status === 'RECEBIDO_ESTOQUE' && `Estoque: ${req.estoquistaNome || 'Atribuído'}`}
                              {req.status === 'MATERIAL_SEPARADO' && `Pronto na Doca`}
                              {req.status === 'EM_TRANSPORTE' && `Abastecedor: ${req.abastecedorNome || 'Em trânsito'}`}
                              {req.status === 'ENTREGA_REALIZADA' && `Entregue por: ${req.abastecedorNome}`}
                              {req.status === 'FINALIZADA' && `Recebido e Concluído`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectRequestDetails(req)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-[10px] shrink-0"
                          >
                            Ver Trilha
                          </button>
                        </div>
                      </div>

                      {/* Contextual Action Buttons (Conforme Contexto & Perfil) */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        {/* 1. SOLICITADO -> Estoquista ou Admin ACEITA */}
                        {req.status === 'SOLICITADO' && (
                          <div className="grid grid-cols-1 gap-1">
                            <button
                              type="button"
                              id={`btn-aceitar-${req.id}`}
                              onClick={() => onAcceptRequest(req.id)}
                              className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              Aceitar Separação
                            </button>
                          </div>
                        )}

                        {/* 2. RECEBIDO_ESTOQUE -> Estoquista BIPAR LOTE / SALVAR SEPARAÇÃO */}
                        {req.status === 'RECEBIDO_ESTOQUE' && (
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              id={`btn-escanear-lote-${req.id}`}
                              onClick={() => onOpenScannerForRequest(req)}
                              className="py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Escanear Código
                            </button>
                            <button
                              type="button"
                              id={`btn-concluir-separacao-${req.id}`}
                              onClick={() => onStartTransport(req.id)}
                              className="py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Salvar Separação
                            </button>
                          </div>
                        )}

                        {/* 3. MATERIAL_SEPARADO -> Abastecedor INICIAR TRANSPORTE */}
                        {req.status === 'MATERIAL_SEPARADO' && (
                          <button
                            type="button"
                            id={`btn-iniciar-transporte-${req.id}`}
                            onClick={() => onStartTransport(req.id)}
                            className="w-full py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Iniciar Transporte
                          </button>
                        )}

                        {/* 4. EM_TRANSPORTE -> Abastecedor CONFIRMAR ENTREGA / ESCANEAR POSTO */}
                        {req.status === 'EM_TRANSPORTE' && (
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              id={`btn-escanear-posto-${req.id}`}
                              onClick={() => onOpenScannerForRequest(req)}
                              className="py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Escanear Posto
                            </button>
                            <button
                              type="button"
                              id={`btn-confirmar-entrega-${req.id}`}
                              onClick={() => onConfirmDelivery(req.id)}
                              className="py-1.5 px-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Confirmar Entrega
                            </button>
                          </div>
                        )}

                        {/* 5. ENTREGA_REALIZADA -> Operador de Produção FINALIZAR */}
                        {req.status === 'ENTREGA_REALIZADA' && (
                          <button
                            type="button"
                            id={`btn-finalizar-producao-${req.id}`}
                            onClick={() => onFinalizeRequest(req.id)}
                            className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs animate-bounce"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Finalizar (Confirmar Recebimento)
                          </button>
                        )}

                        {/* 6. FINALIZADA -> Indicador auditável */}
                        {req.status === 'FINALIZADA' && (
                          <div className="py-1 px-2 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Abastecimento Concluído
                          </div>
                        )}

                        {/* Botão Global: Informar Problema */}
                        {req.status !== 'FINALIZADA' && (
                          <button
                            type="button"
                            id={`btn-problema-${req.id}`}
                            onClick={() => onOpenProblemModal(req)}
                            className="w-full py-1 px-2 text-[10px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Informar Problema
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
