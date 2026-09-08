import React, { useState, useMemo } from 'react';
import { 
  MaterialRequest, 
  Material, 
  ProductionLine, 
  User, 
  AuditLog, 
  SystemNotification, 
  RequestStatus, 
  UserRole 
} from './types';
import { 
  INITIAL_REQUESTS, 
  INITIAL_MATERIALS, 
  INITIAL_LINES, 
  INITIAL_USERS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS 
} from './data/initialData';

// Subcomponents
import { RequestKanbanTracker } from './components/requests/RequestKanbanTracker';
import { NewRequestModal } from './components/requests/NewRequestModal';
import { RequestDetailsModal } from './components/requests/RequestDetailsModal';
import { ProblemReportModal } from './components/common/ProblemReportModal';
import { QrScannerModal } from './components/scanner/QrScannerModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { GestorDashboard } from './components/dashboard/GestorDashboard';
import { StockManagementView } from './components/stock/StockManagementView';
import { CadastrosView } from './components/cadastros/CadastrosView';
import { HistoryView } from './components/history/HistoryView';
import { AbastecedorMobileView } from './components/mobile/AbastecedorMobileView';
import { SpecificationViewer } from './components/specification/SpecificationViewer';

// Icons
import { 
  LayoutDashboard, 
  Kanban, 
  Boxes, 
  FolderGit2, 
  History, 
  FileCode, 
  Smartphone, 
  Bell, 
  Plus, 
  QrCode, 
  Shield, 
  User as UserIcon, 
  ChevronDown, 
  Zap, 
  Sparkles,
  Truck,
  CheckCircle2,
  Layers
} from 'lucide-react';

export default function App() {
  // Global State
  const [requests, setRequests] = useState<MaterialRequest[]>(INITIAL_REQUESTS);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [lines, setLines] = useState<ProductionLine[]>(INITIAL_LINES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Active User Profile Simulation (Defaults to Estoquista or Gestor)
  const [currentUserId, setCurrentUserId] = useState<string>('usr-03'); // Carlos Eduardo (Estoquista)
  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'DASHBOARD' | 'ESTOQUE' | 'CADASTROS' | 'HISTORICO' | 'MOBILE' | 'ESPECIFICACAO'>('KANBAN');

  // Modals state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<MaterialRequest | null>(null);

  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [selectedRequestForProblem, setSelectedRequestForProblem] = useState<MaterialRequest | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerContext, setScannerContext] = useState<string>('Leitura Geral');
  const [requestForScanner, setRequestForScanner] = useState<MaterialRequest | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Helper to add audit log
  const logAction = (acao: string, entidade: string, detalhes: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      usuarioNome: currentUser.name,
      usuarioPerfil: currentUser.role,
      acao,
      entidade,
      detalhes,
      ipOrigem: '192.168.10.42 (Terminal Fabril)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to push notification
  const pushNotification = (
    titulo: string, 
    mensagem: string, 
    tipo: 'URGENCIA' | 'ATRASO' | 'FALTA_MATERIAL' | 'PROBLEMA' | 'STATUS',
    prioridade: 'ALTA' | 'MEDIA' | 'BAIXA' = 'MEDIA'
  ) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      titulo,
      mensagem,
      tipo,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lida: false,
      solicitacaoId: 'SOL-AUTO',
      prioridade
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Status transitions
  const handleUpdateStatus = (
    requestId: string, 
    novoStatus: RequestStatus, 
    extraData?: { lote?: string; abastecedorNome?: string; detalhes?: string }
  ) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      const timelineEvent = {
        id: `ev-${Date.now()}`,
        status: novoStatus,
        timestamp,
        responsavelNome: currentUser.name,
        responsavelPapel: currentUser.roleLabel,
        detalhes: extraData?.detalhes || `Status atualizado para ${novoStatus.replace(/_/g, ' ')}`,
        localAtual: novoStatus === 'EM_TRANSPORTE' ? 'Corredor Central Fabril (Rebocador)' : 
                    novoStatus === 'ENTREGA_REALIZADA' ? `${req.linhaNome} - ${req.postoNome}` :
                    req.linhaNome
      };

      return {
        ...req,
        status: novoStatus,
        loteSeparado: extraData?.lote || req.loteSeparado,
        abastecedorNome: extraData?.abastecedorNome || req.abastecedorNome,
        timeline: [...req.timeline, timelineEvent]
      };
    }));

    // Trigger log and notification
    logAction(
      `STATUS_${novoStatus}`,
      `Ordem #${requestId}`,
      `Transição de status para [${novoStatus}] executada por ${currentUser.name}`
    );

    pushNotification(
      `Ordem Atualizada: ${novoStatus.replace(/_/g, ' ')}`,
      `A ordem foi movida para ${novoStatus.replace(/_/g, ' ')} por ${currentUser.name}.`,
      'STATUS',
      'MEDIA'
    );
  };

  // Create new request
  const handleCreateRequest = (newReqData: any) => {
    const id = `req-${Date.now()}`;
    const nextNum = Math.floor(840 + requests.length + 1);
    const numeroOrdem = `SOL-2026-0${nextNum}`;
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newReq: MaterialRequest = {
      ...newReqData,
      id,
      numeroOrdem,
      dataCriacao: timestamp,
      prazoSLA: newReqData.urgencia === 'CRITICO_LINHA_PARADA' ? '10 min' : newReqData.urgencia === 'URGENTE' ? '20 min' : '45 min',
      solicitanteId: currentUser.id,
      status: 'SOLICITADO',
      timeline: [
        {
          id: `ev-${Date.now()}`,
          status: 'SOLICITADO',
          timestamp,
          responsavelNome: currentUser.name,
          responsavelPapel: currentUser.roleLabel,
          localAtual: `${newReqData.linhaNome} - ${newReqData.postoNome}`,
          detalhes: `Solicitação aberta na bancada. Quantidade: ${newReqData.quantidadeSolicitada} ${newReqData.unidadeMedida}.`
        }
      ]
    };

    setRequests(prev => [newReq, ...prev]);

    logAction('CRIAR_SOLICITACAO', numeroOrdem, `Abertura de chamado para ${newReq.materialDescricao} (${newReq.quantidadeSolicitada} ${newReq.unidadeMedida})`);
    
    pushNotification(
      `Nova Solicitação: ${numeroOrdem}`,
      `Material ${newReq.materialDescricao} solicitado para ${newReq.postoNome} com urgência ${newReq.urgencia}.`,
      newReq.urgencia === 'CRITICO_LINHA_PARADA' ? 'URGENCIA' : 'STATUS',
      newReq.urgencia === 'CRITICO_LINHA_PARADA' ? 'ALTA' : 'MEDIA'
    );
  };

  // Submit problem
  const handleSubmitProblem = (motivo: string, descricao: string) => {
    if (!selectedRequestForProblem) return;

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setRequests(prev => prev.map(r => {
      if (r.id !== selectedRequestForProblem.id) return r;
      return {
        ...r,
        status: 'COM_PROBLEMA',
        problemaRelatado: {
          motivo,
          relatadoPor: currentUser.name,
          data: timestamp
        },
        timeline: [
          ...r.timeline,
          {
            id: `ev-${Date.now()}`,
            status: 'COM_PROBLEMA',
            timestamp,
            responsavelNome: currentUser.name,
            responsavelPapel: currentUser.roleLabel,
            detalhes: `Ocorrência: ${motivo} - ${descricao}`
          }
        ]
      };
    }));

    logAction('REPORTAR_PROBLEMA', selectedRequestForProblem.numeroOrdem, `Ocorrência relatada: ${motivo} (${descricao})`);
    pushNotification(
      `Ocorrência em ${selectedRequestForProblem.numeroOrdem}`,
      `Problema relatado por ${currentUser.name}: ${motivo}`,
      'PROBLEMA',
      'ALTA'
    );
  };

  // QR Scanner success handler
  const handleScanSuccess = (code: string) => {
    if (requestForScanner) {
      if (requestForScanner.status === 'RECEBIDO_ESTOQUE') {
        // Separando material: lote escaneado
        handleUpdateStatus(requestForScanner.id, 'MATERIAL_SEPARADO', {
          lote: code.includes('LOT-') ? code : `LOT-AUTO-${code.slice(0, 4)}`,
          detalhes: `Lote físico escaneado com leitor ótico: ${code}`
        });
      } else if (requestForScanner.status === 'EM_TRANSPORTE') {
        // Entregando no posto: código do posto escaneado
        handleUpdateStatus(requestForScanner.id, 'ENTREGA_REALIZADA', {
          detalhes: `QR Code do posto conferido na bancada de descarga (${code})`
        });
      }
      setRequestForScanner(null);
    } else {
      pushNotification('Código Escaneado', `Código decodificado com sucesso: ${code}`, 'STATUS', 'BAIXA');
    }
  };

  // Simulate automated production event
  const handleSimulateQuickOrder = () => {
    const sampleMaterials = materials;
    const randomMat = sampleMaterials[Math.floor(Math.random() * sampleMaterials.length)];
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    const randomPosto = randomLine.postos[Math.floor(Math.random() * randomLine.postos.length)];

    handleCreateRequest({
      materialId: randomMat.id,
      materialCodigo: randomMat.codigo,
      materialDescricao: randomMat.descricao,
      unidadeMedida: randomMat.unidadeMedida,
      quantidadeSolicitada: Math.floor(Math.random() * 8) + 1,
      linhaId: randomLine.id,
      linhaNome: randomLine.nome,
      postoId: randomPosto.id,
      postoNome: randomPosto.nome,
      solicitanteNome: 'Sistema Kanban Automático',
      solicitanteMatricula: 'KAN-99',
      urgencia: Math.random() > 0.6 ? 'CRITICO_LINHA_PARADA' : 'URGENTE'
    });
  };

  // Notification count
  const unreadNotifications = notifications.filter(n => !n.lida).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
          {/* Brand and System Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">SGA-PROD</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 font-mono">
                  v2.4 RT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Abastecimento da Produção & Rastreabilidade de Materiais
              </p>
            </div>
          </div>

          {/* Quick Simulation Action & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Simulation button */}
            <button
              type="button"
              id="quick-simulate-btn"
              onClick={handleSimulateQuickOrder}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/30 transition-colors shadow-2xs"
              title="Dispara automaticamente um pedido aleatório da linha de produção"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simular Chamado</span>
            </button>

            {/* New Request Button */}
            <button
              type="button"
              id="header-new-request-btn"
              onClick={() => setIsNewRequestOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Solicitação</span>
            </button>

            {/* QR Scanner trigger */}
            <button
              type="button"
              id="header-scanner-btn"
              onClick={() => {
                setScannerContext('Leitura Rápida de QR Code de Material ou Posto');
                setRequestForScanner(null);
                setIsScannerOpen(true);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg border border-purple-500/30 transition-colors"
              title="Escanear QR Code com Leitor / Câmera"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              id="header-notification-btn"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Central de Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Interactive Role Switcher Selector */}
            <div className="relative pl-1 border-l border-slate-700 flex items-center">
              <div className="hidden lg:flex flex-col text-right mr-2">
                <span className="text-[11px] font-bold text-white leading-tight">{currentUser.name}</span>
                <span className="text-[9px] font-medium text-blue-400 leading-tight">{currentUser.roleLabel}</span>
              </div>
              <select
                id="role-switcher-select"
                value={currentUserId}
                onChange={(e) => {
                  setCurrentUserId(e.target.value);
                  const selected = users.find(u => u.id === e.target.value);
                  if (selected?.role === 'ABASTECEDOR') {
                    setActiveTab('MOBILE');
                  }
                }}
                className="bg-slate-800 text-white text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                title="Trocar perfil simulado"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.roleLabel.split(' ')[0]} ({u.name.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="bg-slate-950/80 border-t border-slate-800 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex gap-1 py-1">
            <button
              type="button"
              id="tab-kanban"
              onClick={() => setActiveTab('KANBAN')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'KANBAN' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline ao Vivo (6 Etapas)</span>
            </button>

            <button
              type="button"
              id="tab-dashboard"
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'DASHBOARD' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard & SLAs</span>
            </button>

            <button
              type="button"
              id="tab-mobile"
              onClick={() => setActiveTab('MOBILE')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'MOBILE' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Modo Coletor Mobile (Abastecedor)</span>
            </button>

            <button
              type="button"
              id="tab-estoque"
              onClick={() => setActiveTab('ESTOQUE')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'ESTOQUE' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Estoque & Localização</span>
            </button>

            <button
              type="button"
              id="tab-cadastros"
              onClick={() => setActiveTab('CADASTROS')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'CADASTROS' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Cadastros Mestres</span>
            </button>

            <button
              type="button"
              id="tab-historico"
              onClick={() => setActiveTab('HISTORICO')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'HISTORICO' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico & Auditoria</span>
            </button>

            <button
              type="button"
              id="tab-especificacao"
              onClick={() => setActiveTab('ESPECIFICACAO')}
              className={`px-3 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'ESPECIFICACAO' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Especificação Técnica Completa (SRS)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-4">
        {/* Banner with Active Profile Info */}
        <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">Perfil Ativo Simulando:</span>
            <strong className="text-slate-900">{currentUser.name}</strong>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.roleLabel}
            </span>
            <span className="text-slate-400 hidden sm:inline">• Área: {currentUser.assignedArea}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>Ordens ativas no piso: <strong>{requests.filter(r => r.status !== 'FINALIZADA').length}</strong></span>
            <span>Estoque monitorado: <strong>{materials.length} SKUs</strong></span>
          </div>
        </div>

        {/* Dynamic Views based on activeTab */}
        {activeTab === 'KANBAN' && (
          <RequestKanbanTracker
            currentUser={currentUser}
            requests={requests}
            onUpdateStatus={handleUpdateStatus}
            onOpenDetails={(req) => {
              setSelectedRequestForDetails(req);
              setIsDetailsOpen(true);
            }}
            onOpenProblemModal={(req) => {
              setSelectedRequestForProblem(req);
              setIsProblemModalOpen(true);
            }}
            onOpenScanner={(req) => {
              setRequestForScanner(req);
              setScannerContext(
                req.status === 'RECEBIDO_ESTOQUE' 
                  ? `Bipar Código de Barras / QR Code do Lote (${req.materialCodigo})`
                  : `Bipar QR Code do Posto de Descarga (${req.postoNome})`
              );
              setIsScannerOpen(true);
            }}
          />
        )}

        {activeTab === 'DASHBOARD' && (
          <GestorDashboard
            requests={requests}
            materials={materials}
            onOpenNewRequest={() => setIsNewRequestOpen(true)}
          />
        )}

        {activeTab === 'MOBILE' && (
          <AbastecedorMobileView
            currentUser={currentUser}
            requests={requests}
            onStartTransport={(reqId) => {
              handleUpdateStatus(reqId, 'EM_TRANSPORTE', {
                abastecedorNome: currentUser.name,
                detalhes: `Transporte iniciado pelo abastecedor ${currentUser.name} no Rebocador R-04`
              });
            }}
            onConfirmDelivery={(reqId) => {
              handleUpdateStatus(reqId, 'ENTREGA_REALIZADA', {
                detalhes: `Material descarregado e entregue na bancada física`
              });
            }}
            onOpenScanner={(req) => {
              setRequestForScanner(req);
              setScannerContext(`Confirmação de Entrega: Bipar Posto ${req.postoNome}`);
              setIsScannerOpen(true);
            }}
            onOpenProblemModal={(req) => {
              setSelectedRequestForProblem(req);
              setIsProblemModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ESTOQUE' && (
          <StockManagementView
            materials={materials}
            onOpenScanner={() => {
              setRequestForScanner(null);
              setScannerContext('Leitura de Endereço de Prateleira ou Caixa');
              setIsScannerOpen(true);
            }}
            onUpdateMaterial={(updated) => {
              setMaterials(prev => prev.map(m => m.id === updated.id ? updated : m));
              logAction('AJUSTAR_ESTOQUE', updated.codigo, `Saldo ajustado manualmente para ${updated.saldoAtual} ${updated.unidadeMedida}`);
            }}
          />
        )}

        {activeTab === 'CADASTROS' && (
          <CadastrosView
            materials={materials}
            lines={lines}
            users={users}
            onSaveMaterial={(mat) => {
              setMaterials(prev => {
                const exists = prev.some(m => m.id === mat.id);
                return exists ? prev.map(m => m.id === mat.id ? mat : m) : [mat, ...prev];
              });
              logAction('SALVAR_CADASTRO_MATERIAL', mat.codigo, `Cadastro de material salvo: ${mat.descricao}`);
            }}
            onDeleteMaterial={(id) => {
              setMaterials(prev => prev.filter(m => m.id !== id));
              logAction('EXCLUIR_CADASTRO_MATERIAL', id, `Material removido da base`);
            }}
            onSaveLine={(line) => {
              setLines(prev => {
                const exists = prev.some(l => l.id === line.id);
                return exists ? prev.map(l => l.id === line.id ? line : l) : [line, ...prev];
              });
              logAction('SALVAR_CADASTRO_LINHA', line.codigo, `Linha de produção salva: ${line.nome}`);
            }}
            onDeleteLine={(id) => {
              setLines(prev => prev.filter(l => l.id !== id));
              logAction('EXCLUIR_CADASTRO_LINHA', id, `Linha de produção removida`);
            }}
            onSaveUser={(u) => {
              setUsers(prev => {
                const exists = prev.some(usr => usr.id === u.id);
                return exists ? prev.map(usr => usr.id === u.id ? u : usr) : [u, ...prev];
              });
              logAction('SALVAR_CADASTRO_USUARIO', u.name, `Usuário salvo com perfil ${u.roleLabel}`);
            }}
            onDeleteUser={(id) => {
              setUsers(prev => prev.filter(u => u.id !== id));
              logAction('EXCLUIR_CADASTRO_USUARIO', id, `Usuário desativado`);
            }}
          />
        )}

        {activeTab === 'HISTORICO' && (
          <HistoryView
            logs={auditLogs}
            requests={requests}
          />
        )}

        {activeTab === 'ESPECIFICACAO' && (
          <SpecificationViewer />
        )}
      </main>

      {/* Footer info */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-500">
        <p>
          <strong>SGA-PROD</strong> • Sistema de Gestão e Controle de Abastecimento da Produção em Tempo Real • 
          Arquitetura para 5 Perfis Operacionais com Validação Óptica por QR Code / Barcode
        </p>
      </footer>

      {/* Global Modals */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        materials={materials}
        lines={lines}
        currentUser={currentUser}
        onSubmit={handleCreateRequest}
      />

      <RequestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequestForDetails}
      />

      <ProblemReportModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        request={selectedRequestForProblem}
        onSubmit={handleSubmitProblem}
      />

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        contextTitle={scannerContext}
        targetExpectedCode={requestForScanner?.materialCodigo || requestForScanner?.postoNome}
        onScanSuccess={handleScanSuccess}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
        }}
        onClearAll={() => setNotifications([])}
      />
    </div>
  );
}
