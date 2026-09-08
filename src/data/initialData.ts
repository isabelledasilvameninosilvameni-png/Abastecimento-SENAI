import { User, ProductionLine, Material, MaterialRequest, SystemNotification, AuditLog, StockMovement } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: "usr-01",
    name: "Roberto Neves",
    email: "roberto.neves@industria.com",
    role: "ADMIN",
    roleLabel: "Administrador de Sistemas",
    badgeNumber: "ADM-9011",
    assignedArea: "Governança & TI Industrial"
  },
  {
    id: "usr-02",
    name: "Fernanda Rocha",
    email: "fernanda.rocha@industria.com",
    role: "GESTOR",
    roleLabel: "Gestora de Logística & PCM",
    badgeNumber: "GES-4420",
    assignedArea: "Engenharia de Produção & Supply"
  },
  {
    id: "usr-03",
    name: "Carlos Santos",
    email: "carlos.santos@industria.com",
    role: "ESTOQUISTA",
    roleLabel: "Operador de Almoxarifado",
    badgeNumber: "EST-3104",
    assignedArea: "Almoxarifado Central (Prédio B)"
  },
  {
    id: "usr-04",
    name: "Marcos Lima",
    email: "marcos.lima@industria.com",
    role: "ABASTECEDOR",
    roleLabel: "Operador de Logística Interna (Milk Run)",
    badgeNumber: "ABA-7712",
    assignedArea: "Rebocador Elétrico R-04 / Linhas 1 a 3"
  },
  {
    id: "usr-05",
    name: "João Silva",
    email: "joao.silva@industria.com",
    role: "OPERADOR_PRODUCAO",
    roleLabel: "Operador de Montagem",
    badgeNumber: "OP-1088",
    assignedArea: "Linha 1 - Posto P-02 (Montagem Mecânica)"
  }
];

export const INITIAL_LINES: ProductionLine[] = [
  {
    id: "lin-01",
    codigo: "LIN-01",
    nome: "Linha 1 - Montagem Chassi & Mecânica",
    setor: "Montagem Principal",
    ativa: true,
    postos: [
      { id: "pst-01", codigo: "P-01", nome: "P-01 Estruturação Base", linhaId: "lin-01", linhaNome: "Linha 1", qrCodePosto: "LOC-L1-P01" },
      { id: "pst-02", codigo: "P-02", nome: "P-02 Fixação Eixos e Rolamentos", linhaId: "lin-01", linhaNome: "Linha 1", qrCodePosto: "LOC-L1-P02" },
      { id: "pst-03", codigo: "P-03", nome: "P-03 Chicote Elétrico Principal", linhaId: "lin-01", linhaNome: "Linha 1", qrCodePosto: "LOC-L1-P03" },
      { id: "pst-04", codigo: "P-04", nome: "P-04 Teste Mecânico e Torque", linhaId: "lin-01", linhaNome: "Linha 1", qrCodePosto: "LOC-L1-P04" }
    ]
  },
  {
    id: "lin-02",
    codigo: "LIN-02",
    nome: "Linha 2 - Eletrônica & Acabamento",
    setor: "Eletrônica Integrada",
    ativa: true,
    postos: [
      { id: "pst-05", codigo: "P-05", nome: "P-05 Montagem de Placas PCB", linhaId: "lin-02", linhaNome: "Linha 2", qrCodePosto: "LOC-L2-P05" },
      { id: "pst-06", codigo: "P-06", nome: "P-06 Display & Conectividade", linhaId: "lin-02", linhaNome: "Linha 2", qrCodePosto: "LOC-L2-P06" },
      { id: "pst-07", codigo: "P-07", nome: "P-07 Embalagem & Etiquetagem", linhaId: "lin-02", linhaNome: "Linha 2", qrCodePosto: "LOC-L2-P07" }
    ]
  },
  {
    id: "lin-03",
    codigo: "LIN-03",
    nome: "Linha 3 - Célula de Usinagem & Subconjuntos",
    setor: "Metalmecânica",
    ativa: true,
    postos: [
      { id: "pst-08", codigo: "P-08", nome: "P-08 Torno CNC 01", linhaId: "lin-03", linhaNome: "Linha 3", qrCodePosto: "LOC-L3-P08" },
      { id: "pst-09", codigo: "P-09", nome: "P-09 Retífica e Ajuste Fino", linhaId: "lin-03", linhaNome: "Linha 3", qrCodePosto: "LOC-L3-P09" }
    ]
  }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: "mat-01",
    codigo: "MAT-4029",
    descricao: "Parafuso Sextavado M8 x 45mm Aço 8.8 Galvanizado",
    categoria: "Elementos de Fixação",
    unidadeMedida: "CX (100un)",
    saldoAtual: 84,
    estoqueMinimo: 20,
    estoqueSeguranca: 10,
    localizacao: {
      corredor: "A",
      rua: "03",
      prateleira: "02",
      nivel: "N-1",
      codigoCompleto: "ALM-A-03-P02-N1"
    },
    qrCodeValor: "MAT-4029|LOT-882",
    lotePadrao: "LOT-2026-F88"
  },
  {
    id: "mat-02",
    codigo: "MAT-1108",
    descricao: "Rolamento Rígido de Esferas 6204-2RS D=20mm",
    categoria: "Transmissão Mecânica",
    unidadeMedida: "UN",
    saldoAtual: 42,
    estoqueMinimo: 15,
    estoqueSeguranca: 8,
    localizacao: {
      corredor: "A",
      rua: "01",
      prateleira: "04",
      nivel: "N-2",
      codigoCompleto: "ALM-A-01-P04-N2"
    },
    qrCodeValor: "MAT-1108|LOT-6204",
    lotePadrao: "LOT-2026-R19"
  },
  {
    id: "mat-03",
    codigo: "MAT-7734",
    descricao: "Chicote Elétrico 12V com Conector Selado IP67",
    categoria: "Componentes Elétricos",
    unidadeMedida: "UN",
    saldoAtual: 14,
    estoqueMinimo: 25,
    estoqueSeguranca: 12,
    localizacao: {
      corredor: "B",
      rua: "02",
      prateleira: "01",
      nivel: "N-3",
      codigoCompleto: "ALM-B-02-P01-N3"
    },
    qrCodeValor: "MAT-7734|LOT-IP67",
    lotePadrao: "LOT-2026-E44"
  },
  {
    id: "mat-04",
    codigo: "MAT-9055",
    descricao: "Módulo Microcontrolador Industrial ARM Cortex-M4",
    categoria: "Eletrônica Embarcada",
    unidadeMedida: "UN",
    saldoAtual: 68,
    estoqueMinimo: 15,
    estoqueSeguranca: 10,
    localizacao: {
      corredor: "B",
      rua: "04",
      prateleira: "03",
      nivel: "N-2",
      codigoCompleto: "ALM-B-04-P03-N2"
    },
    qrCodeValor: "MAT-9055|LOT-ARM4",
    lotePadrao: "LOT-2026-M02"
  },
  {
    id: "mat-05",
    codigo: "MAT-3310",
    descricao: "Gaxeta de Vedação em Neoprene Resistente a Óleo",
    categoria: "Vedações & Polímeros",
    unidadeMedida: "PCT (50un)",
    saldoAtual: 9,
    estoqueMinimo: 15,
    estoqueSeguranca: 8,
    localizacao: {
      corredor: "C",
      rua: "01",
      prateleira: "02",
      nivel: "N-1",
      codigoCompleto: "ALM-C-01-P02-N1"
    },
    qrCodeValor: "MAT-3310|LOT-NEO",
    lotePadrao: "LOT-2026-V88"
  },
  {
    id: "mat-06",
    codigo: "MAT-5520",
    descricao: "Sensor Fotoelétrico Difuso 24V PNP Alcance 300mm",
    categoria: "Sensores & Automação",
    unidadeMedida: "UN",
    saldoAtual: 31,
    estoqueMinimo: 10,
    estoqueSeguranca: 5,
    localizacao: {
      corredor: "B",
      rua: "03",
      prateleira: "02",
      nivel: "N-2",
      codigoCompleto: "ALM-B-03-P02-N2"
    },
    qrCodeValor: "MAT-5520|LOT-PNP",
    lotePadrao: "LOT-2026-S11"
  }
];

export const INITIAL_REQUESTS: MaterialRequest[] = [
  {
    id: "req-101",
    numeroOrdem: "SOL-2026-0841",
    materialId: "mat-01",
    materialCodigo: "MAT-4029",
    materialDescricao: "Parafuso Sextavado M8 x 45mm Aço 8.8 Galvanizado",
    unidadeMedida: "CX (100un)",
    quantidadeSolicitada: 2,
    quantidadeEntregue: 2,
    loteSeparado: "LOT-2026-F88",
    linhaId: "lin-01",
    linhaNome: "Linha 1 - Montagem Chassi & Mecânica",
    postoId: "pst-02",
    postoNome: "P-02 Fixação Eixos e Rolamentos",
    urgencia: "CRITICO_LINHA_PARADA",
    prazoSLA: "5 min",
    status: "EM_TRANSPORTE",
    solicitanteId: "usr-05",
    solicitanteNome: "João Silva",
    estoquistaId: "usr-03",
    estoquistaNome: "Carlos Santos",
    abastecedorId: "usr-04",
    abastecedorNome: "Marcos Lima",
    dataCriacao: "2026-09-08T12:35:00Z",
    dataRecebimentoEstoque: "2026-09-08T12:36:10Z",
    dataSeparacao: "2026-09-08T12:38:40Z",
    dataInicioTransporte: "2026-09-08T12:40:00Z",
    observacao: "Estoque do posto zerado! Montagem parada no posto P-02.",
    timeline: [
      { id: "tm-1", status: "SOLICITADO", timestamp: "12:35:00", responsavelNome: "João Silva", responsavelPapel: "Operador de Produção", detalhes: "Abertura com urgência máxima (Linha Parada)", localAtual: "Posto P-02" },
      { id: "tm-2", status: "RECEBIDO_ESTOQUE", timestamp: "12:36:10", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Aceite da ordem e início do picking na rua A-03", localAtual: "Almoxarifado Central" },
      { id: "tm-3", status: "MATERIAL_SEPARADO", timestamp: "12:38:40", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Bipado lote LOT-2026-F88 e disponibilizado na Doca 2", localAtual: "Doca de Expedição" },
      { id: "tm-4", status: "EM_TRANSPORTE", timestamp: "12:40:00", responsavelNome: "Marcos Lima", responsavelPapel: "Abastecedor", detalhes: "Carga embarcada no Rebocador R-04 rumo à Linha 1", localAtual: "Corredor Central de Logística" }
    ]
  },
  {
    id: "req-102",
    numeroOrdem: "SOL-2026-0842",
    materialId: "mat-02",
    materialCodigo: "MAT-1108",
    materialDescricao: "Rolamento Rígido de Esferas 6204-2RS D=20mm",
    unidadeMedida: "UN",
    quantidadeSolicitada: 6,
    linhaId: "lin-01",
    linhaNome: "Linha 1 - Montagem Chassi & Mecânica",
    postoId: "pst-01",
    postoNome: "P-01 Estruturação Base",
    urgencia: "URGENTE",
    prazoSLA: "15 min",
    status: "MATERIAL_SEPARADO",
    solicitanteId: "usr-05",
    solicitanteNome: "João Silva",
    estoquistaId: "usr-03",
    estoquistaNome: "Carlos Santos",
    loteSeparado: "LOT-2026-R19",
    dataCriacao: "2026-09-08T12:38:00Z",
    dataRecebimentoEstoque: "2026-09-08T12:39:15Z",
    dataSeparacao: "2026-09-08T12:43:00Z",
    observacao: "Reabastecimento para batelada da tarde.",
    timeline: [
      { id: "tm-5", status: "SOLICITADO", timestamp: "12:38:00", responsavelNome: "João Silva", responsavelPapel: "Operador de Produção", detalhes: "Abertura regular de kanban", localAtual: "Posto P-01" },
      { id: "tm-6", status: "RECEBIDO_ESTOQUE", timestamp: "12:39:15", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Picking na estante ALM-A-01-P04-N2", localAtual: "Almoxarifado Central" },
      { id: "tm-7", status: "MATERIAL_SEPARADO", timestamp: "12:43:00", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Pronto na bancada aguardando rebocador", localAtual: "Doca 01" }
    ]
  },
  {
    id: "req-103",
    numeroOrdem: "SOL-2026-0843",
    materialId: "mat-04",
    materialCodigo: "MAT-9055",
    materialDescricao: "Módulo Microcontrolador Industrial ARM Cortex-M4",
    unidadeMedida: "UN",
    quantidadeSolicitada: 10,
    linhaId: "lin-02",
    linhaNome: "Linha 2 - Eletrônica & Acabamento",
    postoId: "pst-05",
    postoNome: "P-05 Montagem de Placas PCB",
    urgencia: "NORMAL",
    prazoSLA: "30 min",
    status: "RECEBIDO_ESTOQUE",
    solicitanteId: "usr-05",
    solicitanteNome: "Operador Linha 2",
    estoquistaId: "usr-03",
    estoquistaNome: "Carlos Santos",
    dataCriacao: "2026-09-08T12:42:00Z",
    dataRecebimentoEstoque: "2026-09-08T12:44:00Z",
    timeline: [
      { id: "tm-8", status: "SOLICITADO", timestamp: "12:42:00", responsavelNome: "Operador Linha 2", responsavelPapel: "Operador de Produção", detalhes: "Pedido de reposição de turno", localAtual: "Posto P-05" },
      { id: "tm-9", status: "RECEBIDO_ESTOQUE", timestamp: "12:44:00", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Ordem aceita, separando caixa lacrada", localAtual: "Almoxarifado B" }
    ]
  },
  {
    id: "req-104",
    numeroOrdem: "SOL-2026-0844",
    materialId: "mat-03",
    materialCodigo: "MAT-7734",
    materialDescricao: "Chicote Elétrico 12V com Conector Selado IP67",
    unidadeMedida: "UN",
    quantidadeSolicitada: 5,
    linhaId: "lin-01",
    linhaNome: "Linha 1 - Montagem Chassi & Mecânica",
    postoId: "pst-03",
    postoNome: "P-03 Chicote Elétrico Principal",
    urgencia: "NORMAL",
    prazoSLA: "30 min",
    status: "SOLICITADO",
    solicitanteId: "usr-05",
    solicitanteNome: "João Silva",
    dataCriacao: "2026-09-08T12:46:00Z",
    timeline: [
      { id: "tm-10", status: "SOLICITADO", timestamp: "12:46:00", responsavelNome: "João Silva", responsavelPapel: "Operador de Produção", detalhes: "Aguardando aceite do almoxarife", localAtual: "Posto P-03" }
    ]
  },
  {
    id: "req-105",
    numeroOrdem: "SOL-2026-0839",
    materialId: "mat-06",
    materialCodigo: "MAT-5520",
    materialDescricao: "Sensor Fotoelétrico Difuso 24V PNP Alcance 300mm",
    unidadeMedida: "UN",
    quantidadeSolicitada: 4,
    quantidadeEntregue: 4,
    loteSeparado: "LOT-2026-S11",
    linhaId: "lin-01",
    linhaNome: "Linha 1 - Montagem Chassi & Mecânica",
    postoId: "pst-04",
    postoNome: "P-04 Teste Mecânico e Torque",
    urgencia: "URGENTE",
    prazoSLA: "15 min",
    status: "ENTREGA_REALIZADA",
    solicitanteId: "usr-05",
    solicitanteNome: "Operador Teste",
    estoquistaId: "usr-03",
    estoquistaNome: "Carlos Santos",
    abastecedorId: "usr-04",
    abastecedorNome: "Marcos Lima",
    dataCriacao: "2026-09-08T12:15:00Z",
    dataRecebimentoEstoque: "2026-09-08T12:16:00Z",
    dataSeparacao: "2026-09-08T12:20:00Z",
    dataInicioTransporte: "2026-09-08T12:23:00Z",
    dataEntrega: "2026-09-08T12:29:00Z",
    timeline: [
      { id: "tm-11", status: "SOLICITADO", timestamp: "12:15:00", responsavelNome: "Operador Teste", responsavelPapel: "Operador", detalhes: "Chamado urgente de sensor para calibração", localAtual: "P-04" },
      { id: "tm-12", status: "RECEBIDO_ESTOQUE", timestamp: "12:16:00", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Aceite rápido", localAtual: "Estoque" },
      { id: "tm-13", status: "MATERIAL_SEPARADO", timestamp: "12:20:00", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Separação e validação do lote", localAtual: "Doca 01" },
      { id: "tm-14", status: "EM_TRANSPORTE", timestamp: "12:23:00", responsavelNome: "Marcos Lima", responsavelPapel: "Abastecedor", detalhes: "Saída no carrinho elétrico", localAtual: "Trânsito" },
      { id: "tm-15", status: "ENTREGA_REALIZADA", timestamp: "12:29:00", responsavelNome: "Marcos Lima", responsavelPapel: "Abastecedor", detalhes: "Descarregado no posto P-04. Aguardando confirmação do operador", localAtual: "Posto P-04" }
    ]
  },
  {
    id: "req-106",
    numeroOrdem: "SOL-2026-0835",
    materialId: "mat-01",
    materialCodigo: "MAT-4029",
    materialDescricao: "Parafuso Sextavado M8 x 45mm Aço 8.8 Galvanizado",
    unidadeMedida: "CX (100un)",
    quantidadeSolicitada: 3,
    quantidadeEntregue: 3,
    loteSeparado: "LOT-2026-F88",
    linhaId: "lin-01",
    linhaNome: "Linha 1 - Montagem Chassi & Mecânica",
    postoId: "pst-01",
    postoNome: "P-01 Estruturação Base",
    urgencia: "NORMAL",
    prazoSLA: "30 min",
    status: "FINALIZADA",
    solicitanteId: "usr-05",
    solicitanteNome: "João Silva",
    estoquistaId: "usr-03",
    estoquistaNome: "Carlos Santos",
    abastecedorId: "usr-04",
    abastecedorNome: "Marcos Lima",
    dataCriacao: "2026-09-08T11:40:00Z",
    dataRecebimentoEstoque: "2026-09-08T11:42:00Z",
    dataSeparacao: "2026-09-08T11:47:00Z",
    dataInicioTransporte: "2026-09-08T11:51:00Z",
    dataEntrega: "2026-09-08T11:56:00Z",
    dataConfirmacao: "2026-09-08T11:58:30Z",
    timeline: [
      { id: "tm-16", status: "SOLICITADO", timestamp: "11:40:00", responsavelNome: "João Silva", responsavelPapel: "Operador", detalhes: "Pedido matinal", localAtual: "P-01" },
      { id: "tm-17", status: "RECEBIDO_ESTOQUE", timestamp: "11:42:00", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Separado conforme BOM", localAtual: "Estoque" },
      { id: "tm-18", status: "MATERIAL_SEPARADO", timestamp: "11:47:00", responsavelNome: "Carlos Santos", responsavelPapel: "Estoquista", detalhes: "Disponibilizado na Doca", localAtual: "Doca" },
      { id: "tm-19", status: "EM_TRANSPORTE", timestamp: "11:51:00", responsavelNome: "Marcos Lima", responsavelPapel: "Abastecedor", detalhes: "Transporte sem retenções", localAtual: "Trânsito" },
      { id: "tm-20", status: "ENTREGA_REALIZADA", timestamp: "11:56:00", responsavelNome: "Marcos Lima", responsavelPapel: "Abastecedor", detalhes: "Entregue e bipado no posto", localAtual: "P-01" },
      { id: "tm-21", status: "FINALIZADA", timestamp: "11:58:30", responsavelNome: "João Silva", responsavelPapel: "Operador", detalhes: "Recebimento confirmado 100% conforme. Lead Time: 18.5 min.", localAtual: "P-01" }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "not-01",
    tipo: "URGENCIA",
    titulo: "Chamado Crítico: Linha Parada!",
    mensagem: "Ordem SOL-2026-0841 aberta para Linha 1 / Posto P-02 (MAT-4029). SLA: 5 minutos.",
    timestamp: "Há 12 min",
    lida: false,
    solicitacaoId: "req-101",
    prioridade: "ALTA"
  },
  {
    id: "not-02",
    tipo: "FALTA_MATERIAL",
    titulo: "Alerta de Estoque Mínimo: MAT-3310",
    mensagem: "Gaxeta de Vedação em Neoprene atingiu 9 PCT (Mínimo: 15 PCT). Ponto de ressuprimento acionado.",
    timestamp: "Há 25 min",
    lida: false,
    prioridade: "MEDIA"
  },
  {
    id: "not-03",
    tipo: "STATUS",
    titulo: "Material em Transporte para P-02",
    mensagem: "Abastecedor Marcos Lima iniciou transporte do lote LOT-2026-F88.",
    timestamp: "Há 8 min",
    lida: true,
    solicitacaoId: "req-101",
    prioridade: "BAIXA"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-101",
    timestamp: "2026-09-08 12:40:00",
    usuarioNome: "Marcos Lima",
    usuarioPerfil: "ABASTECEDOR",
    acao: "INICIAR_TRANSPORTE",
    entidade: "SOL-2026-0841",
    detalhes: "Transporte iniciado via Rebocador R-04 destino Linha 1 Posto P-02",
    ipOrigem: "192.168.12.88 (Zebra TC26)"
  },
  {
    id: "log-102",
    timestamp: "2026-09-08 12:38:40",
    usuarioNome: "Carlos Santos",
    usuarioPerfil: "ESTOQUISTA",
    acao: "SEPARAR_LOTE",
    entidade: "SOL-2026-0841",
    detalhes: "Bipado código QR MAT-4029|LOT-882. Saldo reservado na doca 2",
    ipOrigem: "192.168.10.15 (Terminal Almoxarifado)"
  },
  {
    id: "log-103",
    timestamp: "2026-09-08 12:36:10",
    usuarioNome: "Carlos Santos",
    usuarioPerfil: "ESTOQUISTA",
    acao: "ACEITAR_SOLICITACAO",
    entidade: "SOL-2026-0841",
    detalhes: "Ordem aceita para picking na estante ALM-A-03-P02-N1",
    ipOrigem: "192.168.10.15 (Terminal Almoxarifado)"
  },
  {
    id: "log-104",
    timestamp: "2026-09-08 12:35:00",
    usuarioNome: "João Silva",
    usuarioPerfil: "OPERADOR_PRODUCAO",
    acao: "CRIAR_SOLICITACAO",
    entidade: "SOL-2026-0841",
    detalhes: "Solicitação aberta com prioridade CRITICO_LINHA_PARADA",
    ipOrigem: "192.168.20.4 (Quiosque Posto P-02)"
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-001",
    materialId: "mat-01",
    materialCodigo: "MAT-4029",
    materialDescricao: "Parafuso Sextavado M8 x 45mm Aço 8.8 Galvanizado",
    tipo: "ENTRADA_COMPRA",
    tipoLabel: "Entrada por Compra / Recebimento",
    natureza: "ENTRADA",
    quantidade: 30,
    saldoAnterior: 54,
    saldoNovo: 84,
    unidadeMedida: "CX (100un)",
    lote: "LOT-2026-F88",
    documentoRef: "NF-008921",
    motivo: "Recebimento programado de fornecedor Metalúrgica Acier",
    responsavelNome: "Carlos Santos",
    responsavelId: "usr-03",
    responsavelPerfil: "ESTOQUISTA",
    dataHora: "2026-09-08 09:30:15"
  },
  {
    id: "mov-002",
    materialId: "mat-03",
    materialCodigo: "MAT-7734",
    materialDescricao: "Chicote Elétrico 12V com Conector Selado IP67",
    tipo: "SAIDA_AVARIA",
    tipoLabel: "Saída por Avaria / Danificado",
    natureza: "SAIDA",
    quantidade: 2,
    saldoAnterior: 16,
    saldoNovo: 14,
    unidadeMedida: "UN",
    lote: "LOT-2026-E44",
    documentoRef: "RNC-104",
    motivo: "Conector quebrado durante inspeção na doca de descarga",
    responsavelNome: "Carlos Santos",
    responsavelId: "usr-03",
    responsavelPerfil: "ESTOQUISTA",
    dataHora: "2026-09-08 10:15:40"
  },
  {
    id: "mov-003",
    materialId: "mat-04",
    materialCodigo: "MAT-5512",
    materialDescricao: "Sensor Indutivo de Proximidade M12 PNP NA",
    tipo: "AJUSTE_INVENTARIO",
    tipoLabel: "Ajuste de Balanço / Inventário",
    natureza: "AJUSTE",
    quantidade: 2,
    saldoAnterior: 17,
    saldoNovo: 19,
    unidadeMedida: "UN",
    lote: "LOT-2026-S02",
    documentoRef: "INV-CICL-09",
    motivo: "Contagem física cíclica na estante B-03 identificou 2 unidades a mais",
    responsavelNome: "Fernanda Rocha",
    responsavelId: "usr-02",
    responsavelPerfil: "GESTOR",
    dataHora: "2026-09-08 11:05:00"
  }
];

