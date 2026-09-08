import React from 'react';
import { MaterialRequest, User } from '../../types';
import { Truck, MapPin, QrCode, Play, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface AbastecedorMobileViewProps {
  currentUser: User;
  requests: MaterialRequest[];
  onStartTransport: (reqId: string) => void;
  onConfirmDelivery: (reqId: string) => void;
  onOpenScanner: (req: MaterialRequest) => void;
  onOpenProblemModal: (req: MaterialRequest) => void;
}

export const AbastecedorMobileView: React.FC<AbastecedorMobileViewProps> = ({
  currentUser,
  requests,
  onStartTransport,
  onConfirmDelivery,
  onOpenScanner,
  onOpenProblemModal
}) => {
  // Filter requests relevant for Abastecedor: MATERIAL_SEPARADO and EM_TRANSPORTE
  const readyForPickup = requests.filter(r => r.status === 'MATERIAL_SEPARADO');
  const inTransit = requests.filter(r => r.status === 'EM_TRANSPORTE');
  const completedToday = requests.filter(r => r.status === 'ENTREGA_REALIZADA' || r.status === 'FINALIZADA').length;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-8">
      {/* Mobile Device Header Card */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">Modo Coletor / Mobile</div>
              <h2 className="font-extrabold text-sm">{currentUser.name}</h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Veículo / Área</span>
            <span className="text-xs font-mono font-bold text-amber-300">Rebocador R-04</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
          <div className="p-2 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Para Coletar</span>
            <span className="text-base font-extrabold font-mono text-amber-400">{readyForPickup.length}</span>
          </div>
          <div className="p-2 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Em Trânsito</span>
            <span className="text-base font-extrabold font-mono text-blue-400">{inTransit.length}</span>
          </div>
          <div className="p-2 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Entregues</span>
            <span className="text-base font-extrabold font-mono text-emerald-400">{completedToday}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Cargas Atualmente em Trânsito no Rebocador */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            Cargas em Transporte ({inTransit.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Prioridade Máxima</span>
        </div>

        {inTransit.length === 0 ? (
          <div className="p-4 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
            Nenhuma carga embarcada no momento. Coleta pronta na Doca abaixo.
          </div>
        ) : (
          inTransit.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-2xl border-2 border-purple-400 shadow-md space-y-3 mb-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {req.numeroOrdem}
                </span>
                {req.urgencia === 'CRITICO_LINHA_PARADA' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-700 animate-pulse">
                    🚨 LINHA PARADA
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    {req.urgencia}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{req.materialDescricao}</h4>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-mono text-slate-500">{req.materialCodigo}</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {req.quantidadeSolicitada} {req.unidadeMedida}
                  </span>
                </div>
                {req.loteSeparado && (
                  <div className="mt-1 text-xs text-indigo-700 font-mono">
                    Lote Validado: <strong>{req.loteSeparado}</strong>
                  </div>
                )}
              </div>

              {/* Rota do Transporte */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Origem: Almoxarifado Central (Doca 02)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs pt-1 border-t border-slate-200">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>DESCARGA: {req.linhaNome} ➔ {req.postoNome}</span>
                </div>
              </div>

              {/* Big Touch Action Buttons for Forklift Operator */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  id={`mobile-scan-deliver-${req.id}`}
                  onClick={() => onOpenScanner(req)}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
                >
                  <QrCode className="w-5 h-5" />
                  Bipar QR Code do Posto ({req.postoNome})
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id={`mobile-confirm-btn-${req.id}`}
                    onClick={() => onConfirmDelivery(req.id)}
                    className="h-11 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Entrega
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenProblemModal(req)}
                    className="h-11 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Problema
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECTION 2: Cargas Prontas na Doca para Coletar */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Prontas para Coleta na Doca ({readyForPickup.length})
          </h3>
          <span className="text-[11px] text-slate-500">Material Separado</span>
        </div>

        <div className="space-y-3">
          {readyForPickup.length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Nenhuma ordem separada aguardando no momento.
            </div>
          ) : (
            readyForPickup.map((req) => (
              <div
                key={req.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {req.numeroOrdem}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    {req.urgencia}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{req.materialDescricao}</h4>
                  <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                    <span>Destino: <strong>{req.postoNome}</strong></span>
                    <span className="font-bold text-emerald-700">{req.quantidadeSolicitada} {req.unidadeMedida}</span>
                  </div>
                </div>

                <button
                  type="button"
                  id={`mobile-start-transport-${req.id}`}
                  onClick={() => onStartTransport(req.id)}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Embarcar e Iniciar Transporte
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
