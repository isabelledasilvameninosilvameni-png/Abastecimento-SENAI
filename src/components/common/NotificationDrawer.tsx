import React from 'react';
import { SystemNotification } from '../../types';
import { X, AlertTriangle, Clock, PackageX, Info, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onSelectNotification?: (notif: SystemNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
  onSelectNotification
}) => {
  if (!isOpen) return null;

  const getIcon = (tipo: SystemNotification['tipo']) => {
    switch (tipo) {
      case 'URGENCIA':
        return <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'ATRASO':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'FALTA_MATERIAL':
        return <PackageX className="w-5 h-5 text-rose-600" />;
      case 'PROBLEMA':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        id="notification-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Alertas e Notificações</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            id="close-notifications-btn"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Sistema de Notificações Multicanal (WebSocket / Push)</span>
          {notifications.length > 0 && (
            <button
              id="clear-notifications-btn"
              onClick={onClearAll}
              className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm">
              <CheckCircle2 className="w-10 h-10 mb-2 text-slate-300" />
              Nenhum alerta ativo no momento.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                id={`notification-item-${n.id}`}
                onClick={() => {
                  onMarkAsRead(n.id);
                  if (onSelectNotification) onSelectNotification(n);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  n.lida 
                    ? 'bg-white border-slate-200 opacity-75' 
                    : n.prioridade === 'ALTA'
                      ? 'bg-red-50/80 border-red-200 shadow-xs'
                      : 'bg-blue-50/70 border-blue-200 shadow-xs'
                } hover:border-slate-400`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(n.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        n.prioridade === 'ALTA' ? 'text-red-700' : 'text-slate-700'
                      }`}>
                        {n.tipo.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium shrink-0">{n.timestamp}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">{n.titulo}</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{n.mensagem}</p>
                    {n.solicitacaoId && (
                      <div className="mt-2 text-[11px] font-semibold text-blue-800 bg-blue-100/70 inline-block px-2 py-0.5 rounded">
                        Ordem: {n.solicitacaoId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
