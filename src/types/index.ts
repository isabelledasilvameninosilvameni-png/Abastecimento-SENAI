export type UserRole = 
  | 'ADMIN' 
  | 'GESTOR' 
  | 'ESTOQUISTA' 
  | 'ABASTECEDOR' 
  | 'OPERADOR_PRODUCAO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  badgeNumber: string;
  assignedArea?: string; // ex: 'Linha Alpha', 'Almoxarifado Central', 'Logística Interna'
  avatarUrl?: string;
}

export type RequestStatus = 
  | 'SOLICITADO'          // 1. Produção solicita
  | 'RECEBIDO_ESTOQUE'     // 2. Estoque recebe
  | 'MATERIAL_SEPARADO'    // 3. Material separado
  | 'EM_TRANSPORTE'        // 4. Abastecedor transporta
  | 'ENTREGA_REALIZADA'    // 5. Entrega realizada
  | 'FINALIZADA'           // 6. Produção confirma (Finalizada)
  | 'COM_PROBLEMA';        // Ocorrência relatada

export type UrgencyLevel = 'NORMAL' | 'URGENTE' | 'CRITICO_LINHA_PARADA';

export interface StockLocation {
  corredor: string;
  rua: string;
  prateleira: string;
  nivel: string;
  codigoCompleto: string; // Ex: 'ALM-A-03-N2'
}

export interface Material {
  id: string;
  codigo: string;       // Ex: 'MAT-4029'
  descricao: string;
  categoria: string;
  unidadeMedida: string; // 'UN', 'KG', 'CX', 'RL'
  saldoAtual: number;
  estoqueMinimo: number;
  estoqueSeguranca: number;
  localizacao: StockLocation;
  qrCodeValor: string;
  lotePadrao?: string;
}

export interface WorkStation {
  id: string;
  codigo: string;       // Ex: 'P-01', 'P-02'
  nome: string;
  linhaId: string;
  linhaNome: string;
  qrCodePosto: string;  // Ex: 'LOC-L1-P02'
}

export interface ProductionLine {
  id: string;
  codigo: string;       // Ex: 'LIN-01'
  nome: string;         // Ex: 'Linha 1 - Montagem Alpha'
  setor: string;
  ativa: boolean;
  postos: WorkStation[];
}

export interface RequestTimelineEvent {
  id: string;
  status: RequestStatus;
  timestamp: string;
  responsavelNome: string;
  responsavelPapel: string;
  detalhes?: string;
  localAtual?: string;
}

export interface MaterialRequest {
  id: string;
  numeroOrdem: string; // Ex: 'SOL-2026-0841'
  materialId: string;
  materialCodigo: string;
  materialDescricao: string;
  unidadeMedida: string;
  quantidadeSolicitada: number;
  quantidadeEntregue?: number;
  loteSeparado?: string;
  
  // Destino
  linhaId: string;
  linhaNome: string;
  postoId: string;
  postoNome: string;
  
  // Urgência e Prazos
  urgencia: UrgencyLevel;
  prazoSLA: string; // Ex: '15 min', '30 min'
  
  // Status e Rastreio
  status: RequestStatus;
  solicitanteId: string;
  solicitanteNome: string;
  estoquistaId?: string;
  estoquistaNome?: string;
  abastecedorId?: string;
  abastecedorNome?: string;
  
  dataCriacao: string;
  dataRecebimentoEstoque?: string;
  dataSeparacao?: string;
  dataInicioTransporte?: string;
  dataEntrega?: string;
  dataConfirmacao?: string;
  
  observacao?: string;
  problemaRelatado?: {
    motivo: string;
    relatadoPor: string;
    data: string;
    resolvido: boolean;
  };
  
  timeline: RequestTimelineEvent[];
}

export interface SystemNotification {
  id: string;
  tipo: 'URGENCIA' | 'ATRASO' | 'FALTA_MATERIAL' | 'PROBLEMA' | 'STATUS';
  titulo: string;
  mensagem: string;
  timestamp: string;
  lida: boolean;
  solicitacaoId?: string;
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  usuarioNome: string;
  usuarioPerfil: UserRole;
  acao: string;
  entidade: string;
  detalhes: string;
  ipOrigem?: string;
}

// Specification Types
export interface SpecificationModule {
  id: string;
  numero: number;
  nome: string;
  icone: string;
  descricaoCurta: string;
  perfisAcesso: {
    perfil: UserRole;
    perfilLabel: string;
    nivel: 'TOTAL' | 'OPERACAO' | 'LEITURA' | 'RESTRITO';
    permissoes: string[];
  }[];
  fluxoDados: {
    passo: number;
    ator: string;
    acaoUsuario: string;
    respostaSistema: string;
    validacoes: string[];
  }[];
  informacoesExibidas: {
    categoria: string;
    campos: {
      nome: string;
      tipo: string;
      obrigatorio: boolean;
      descricao: string;
    }[];
    elementosVisuais: string[];
  }[];
  eventosNotificacoes: {
    evento: string;
    gatilho: string;
    destinatarios: string[];
    canal: 'WEBSOCKET' | 'PUSH_MOBILE' | 'TOAST' | 'EMAIL';
    payloadExemplo: string;
  }[];
  regrasNegocio: {
    codigo: string;
    titulo: string;
    regra: string;
    tratativaExcecao: string;
  }[];
}

export interface ActionDefinition {
  nome: string;
  icone: string;
  cor: string;
  ondeAparece: string[];
  perfisAutorizados: UserRole[];
  comportamentoEsperado: string;
  requisitosPreAcao: string[];
  retornoSistema: string;
}
