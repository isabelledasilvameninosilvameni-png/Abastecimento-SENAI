import React, { useState } from 'react';
import { MaterialRequest } from '../../types';
import { X, AlertTriangle, Send } from 'lucide-react';

interface ProblemReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MaterialRequest | null;
  onReportProblem: (requestId: string, motivo: string, detalhes: string) => void;
}

export const ProblemReportModal: React.FC<ProblemReportModalProps> = ({
  isOpen,
  onClose,
  request,
  onReportProblem
}) => {
  const [motivo, setMotivo] = useState('FALTA_SALDO_FISICO');
  const [detalhes, setDetalhes] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalhes.trim()) return;

    onReportProblem(request.id, motivo, detalhes);
    setDetalhes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        id="problem-report-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 bg-rose-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Informar Problema Operacional</h3>
              <p className="text-xs text-rose-200">Ordem: {request.numeroOrdem}</p>
            </div>
          </div>
          <button
            id="close-problem-modal-btn"
            onClick={onClose}
            className="p-1.5 text-rose-300 hover:text-white rounded-lg hover:bg-rose-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            <p className="font-bold">Atenção:</p>
            <p className="mt-0.5">
              Ao registrar uma ocorrência, o status da ordem mudará para <strong>COM PROBLEMA</strong>, o cálculo do SLA será pausado e um alerta imediato será enviado à Gestão de Logística.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo Principal do Bloqueio <span className="text-red-500">*</span>
            </label>
            <select
              id="select-problem-reason"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="FALTA_SALDO_FISICO">Falta de Saldo Físico na Posição (Divergência)</option>
              <option value="LOTE_AVARIADO">Material / Embalagem Avariada no Picking</option>
              <option value="OBSTRUCAO_TRANSPORTE">Via ou Corredor Obstruído (Impossível Acessar Linha)</option>
              <option value="POSTO_LOTADO">Posto de Trabalho sem Espaço para Acondicionamento</option>
              <option value="LOTE_ERRADO">Divergência entre Etiqueta Bipada e Especificação</option>
              <option value="OUTRO">Outro Bloqueio Operacional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição Detalhada do Problema <span className="text-red-500">*</span>
            </label>
            <textarea
              id="textarea-problem-details"
              rows={3}
              required
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              placeholder="Descreva o que ocorreu para rápida ação do gestor e manutenção..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 resize-none"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-problem-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="submit-problem-btn"
              disabled={!detalhes.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              Registrar Problema
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
