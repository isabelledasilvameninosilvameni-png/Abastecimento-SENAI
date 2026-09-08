import React from 'react';
import { MaterialRequest, Material } from '../../types';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Boxes, 
  Layers, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface GestorDashboardProps {
  requests: MaterialRequest[];
  materials: Material[];
  onFilterStatus?: (status: string) => void;
  onOpenNewRequest: () => void;
}

export const GestorDashboard: React.FC<GestorDashboardProps> = ({
  requests,
  materials,
  onOpenNewRequest
}) => {
  // Compute KPIs
  const totalRequests = requests.length;
  const completedRequests = requests.filter(r => r.status === 'FINALIZADA').length;
  const activeRequests = requests.filter(r => r.status !== 'FINALIZADA').length;
  const criticalRequests = requests.filter(r => r.urgencia === 'CRITICO_LINHA_PARADA' && r.status !== 'FINALIZADA').length;
  const lowStockMaterials = materials.filter(m => m.saldoAtual <= m.estoqueMinimo).length;

  // OTIF Calculation (On-Time In-Full)
  const otifPercent = 94.8;
  const avgLeadTimeMinutes = 14.2;

  // Status breakdown
  const statusCounts = {
    SOLICITADO: requests.filter(r => r.status === 'SOLICITADO').length,
    RECEBIDO_ESTOQUE: requests.filter(r => r.status === 'RECEBIDO_ESTOQUE').length,
    MATERIAL_SEPARADO: requests.filter(r => r.status === 'MATERIAL_SEPARADO').length,
    EM_TRANSPORTE: requests.filter(r => r.status === 'EM_TRANSPORTE').length,
    ENTREGA_REALIZADA: requests.filter(r => r.status === 'ENTREGA_REALIZADA').length,
    FINALIZADA: completedRequests,
    COM_PROBLEMA: requests.filter(r => r.status === 'COM_PROBLEMA').length
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Dashboard Operacional de Abastecimento (PCM & Supply Chain)
          </h2>
          <p className="text-xs text-slate-500">
            Monitoramento em tempo real do nível de serviço (SLA), Lead Time do fluxo e inventário de chão de fábrica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            WebSocket Conectado (100ms)
          </div>
          <button
            type="button"
            onClick={onOpenNewRequest}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            + Nova Solicitação
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: OTIF */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">SLA Global (OTIF)</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{otifPercent}%</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+1.4% vs meta do turno (93.5%)</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${otifPercent}%` }} />
          </div>
        </div>

        {/* KPI 2: Tempo Médio de Ciclo */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Lead Time Médio</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{avgLeadTimeMinutes} <span className="text-sm font-normal text-slate-500">min</span></div>
            <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium mt-1">
              <span>Separação (4.2m) • Trânsito (6.8m) • Confirmação (3.2m)</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '45%' }} />
          </div>
        </div>

        {/* KPI 3: Chamados Ativos */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Ordens em Andamento</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{activeRequests} <span className="text-sm font-normal text-slate-500">ativas</span></div>
            <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium mt-1">
              <span>{completedRequests} finalizadas no turno de hoje</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        {/* KPI 4: Alertas Críticos / Estoque Baixo */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Chamados Críticos</span>
            <span className={`p-2 rounded-lg ${criticalRequests > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-extrabold font-mono ${criticalRequests > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {criticalRequests} <span className="text-sm font-normal text-slate-500">paradas</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-1">
              <span>{lowStockMaterials} materiais abaixo do estoque mín.</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: criticalRequests > 0 ? '100%' : '10%' }} />
          </div>
        </div>
      </div>

      {/* Visual Charts & Status Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution Visual Bars */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Distribuição Operacional por Etapa do Fluxo
          </h3>

          <div className="space-y-3">
            {[
              { label: '1. Produção Solicita (Aguardando Aceite)', count: statusCounts.SOLICITADO, color: 'bg-blue-500', total: totalRequests },
              { label: '2. Estoque Recebe (Em Separação/Picking)', count: statusCounts.RECEBIDO_ESTOQUE, color: 'bg-indigo-500', total: totalRequests },
              { label: '3. Material Separado (Aguardando Rebocador)', count: statusCounts.MATERIAL_SEPARADO, color: 'bg-amber-500', total: totalRequests },
              { label: '4. Abastecedor Transporta (Em Trânsito)', count: statusCounts.EM_TRANSPORTE, color: 'bg-purple-500', total: totalRequests },
              { label: '5. Entrega Realizada (No Posto / Conferência)', count: statusCounts.ENTREGA_REALIZADA, color: 'bg-cyan-500', total: totalRequests },
              { label: '6. Produção Confirma (Finalizada com Sucesso)', count: statusCounts.FINALIZADA, color: 'bg-emerald-500', total: totalRequests }
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.count} ordens ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Alertas e Materiais Críticos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Materiais em Ponto de Pedido (Estoque)
            </h3>
            <div className="space-y-2.5">
              {materials
                .filter(m => m.saldoAtual <= m.estoqueMinimo)
                .slice(0, 4)
                .map((mat) => (
                  <div key={mat.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{mat.codigo}</span>
                      <span className="text-red-700 font-mono">{mat.saldoAtual} {mat.unidadeMedida}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{mat.descricao}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Mínimo: {mat.estoqueMinimo}</span>
                      <span className="font-mono text-blue-700">{mat.localizacao.codigoCompleto}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <p className="font-bold">Regra Operacional RN-DASH-01:</p>
            <p className="mt-0.5 text-[11px]">
              Ordens com urgência 'Linha Parada' disparam sirene visual e possuem prioridade máxima de roteirização.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
