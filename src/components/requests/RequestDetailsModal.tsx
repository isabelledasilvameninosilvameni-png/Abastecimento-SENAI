import React from 'react';
import { MaterialRequest } from '../../types';
import { X, CheckCircle2, Clock, MapPin, User, AlertTriangle, ShieldCheck, Box } from 'lucide-react';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MaterialRequest | null;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        id="request-details-card"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">Ordem {request.numeroOrdem}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 font-mono">
                  {request.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400">Rastreabilidade em tempo real e auditoria da cadeia de custódia</p>
            </div>
          </div>
          <button
            id="close-details-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">O que é</span>
              <p className="text-xs font-bold text-slate-900 mt-1">{request.materialDescricao}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                <span>SKU: {request.materialCodigo}</span>
                <strong className="text-emerald-700">{request.quantidadeSolicitada} {request.unidadeMedida}</strong>
              </div>
              {request.loteSeparado && (
                <div className="mt-1 text-[11px] text-indigo-700 font-mono">
                  Lote: {request.loteSeparado}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Onde está / Destino</span>
              <p className="text-xs font-bold text-slate-900 mt-1">{request.linhaNome}</p>
              <p className="text-xs text-blue-700 font-medium">{request.postoNome}</p>
              <p className="text-[11px] text-slate-500 mt-1">Urgência: <strong>{request.urgencia}</strong></p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Status de Recebimento</span>
              <div className="mt-1 flex items-center gap-1.5">
                {request.status === 'FINALIZADA' ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmado pela Produção
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-600" /> Aguardando Confirmação
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Solicitante: {request.solicitanteNome}
              </p>
            </div>
          </div>

          {/* Problem banner if present */}
          {request.problemaRelatado && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ocorrência Registrada: {request.problemaRelatado.motivo}</p>
                <p className="mt-0.5">Por: {request.problemaRelatado.relatadoPor} em {request.problemaRelatado.data}</p>
              </div>
            </div>
          )}

          {/* Timeline / Trilha de Auditoria */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Linha do Tempo e Cadeia de Custódia (Quem & Onde)
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {request.timeline.map((event, idx) => (
                <div key={event.id} className="relative group">
                  {/* Pin icon */}
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">{event.status.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-slate-500">{event.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{event.responsavelNome}</strong> ({event.responsavelPapel})
                      </span>
                      {event.localAtual && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Local: {event.localAtual}
                        </span>
                      )}
                    </div>
                    {event.detalhes && (
                      <p className="mt-1.5 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                        {event.detalhes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
