import React, { useState } from 'react';
import { AuditLog, MaterialRequest } from '../../types';
import { History, Search, Filter, Download, ShieldCheck, Clock, User, ArrowRight } from 'lucide-react';

interface HistoryViewProps {
  logs: AuditLog[];
  requests: MaterialRequest[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ logs, requests }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = logs.filter(l => {
    const matchSearch =
      l.entidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.usuarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detalhes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = roleFilter === 'ALL' || l.usuarioPerfil === roleFilter;

    return matchSearch && matchRole;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'Perfil', 'Ação', 'Entidade/Ordem', 'Detalhes', 'Dispositivo/IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.usuarioNome,
      l.usuarioPerfil,
      l.acao,
      l.entidade,
      `"${l.detalhes.replace(/"/g, '""')}"`,
      l.ipOrigem || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_abastecimento_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Histórico Completo & Trilha de Auditoria Imutável
          </h2>
          <p className="text-xs text-slate-500">
            Registro cronológico de todas as transações, movimentações físicas de material e cadeia de custódia (RN-HIST-01).
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300"
        >
          <Download className="w-4 h-4" />
          Exportar Trilha (.CSV)
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por usuário, ordem (SOL-...), ação ou detalhe..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Perfil:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Todos os Perfis</option>
            <option value="ADMIN">Administrador</option>
            <option value="GESTOR">Gestor</option>
            <option value="ESTOQUISTA">Estoquista</option>
            <option value="ABASTECEDOR">Abastecedor</option>
            <option value="OPERADOR_PRODUCAO">Operador de Produção</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Ordem / Entidade</th>
                <th className="p-3">Ação Registrada</th>
                <th className="p-3">Usuário & Papel</th>
                <th className="p-3">Detalhes da Movimentação</th>
                <th className="p-3">Dispositivo / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">{log.entidade}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 font-mono">
                      {log.acao}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{log.usuarioNome}</div>
                    <div className="text-[10px] text-slate-500">{log.usuarioPerfil}</div>
                  </td>
                  <td className="p-3 text-slate-700 max-w-md">{log.detalhes}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.ipOrigem || 'Sistema'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
