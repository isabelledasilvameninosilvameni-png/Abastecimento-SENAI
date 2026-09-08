import { SpecificationModule, ActionDefinition } from '../types';

export const SYSTEM_METADATA = {
  nomeSistema: "SGA-PROD (Sistema de Gestão de Abastecimento da Produção)",
  versao: "2.4.0-PROD",
  arquitetura: "Distributed Event-Driven Architecture (React SPA/PWA + Express Node.js Engine + WebSocket Real-Time Bus)",
  publicoAlvo: "Plantas Fabris de Manufatura Discreta e Contínua (Setores Automotivo, Eletrônico, Metalmecânico e Bens de Consumo)",
  tempoRespostaMaximo: "< 350ms em transações críticas; < 100ms em sincronização de status via WebSocket",
  dispositivosSuportados: "Desktops (Painel Gestor/Almoxarifado), Tablets Industriais e Smartphones Rugged/Coletores Android (Zebra TC26, Honeywell EDA51, smartphones convencionais)"
};

export const SPECIFICATION_MODULES: SpecificationModule[] = [
  {
    id: "mod-01",
    numero: 1,
    nome: "Autenticação e Controle de Acesso (RBAC)",
    icone: "ShieldCheck",
    descricaoCurta: "Gestão segura de credenciais, autenticação por crachá/QR Code/senha e controle granular de permissões por 5 perfis operacionais.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Criar/Editar/Excluir usuários", "Definir papéis", "Reset de senhas", "Auditar acessos"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "LEITURA", permissoes: ["Visualizar usuários da equipe", "Consultar logs de acesso"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "OPERACAO", permissoes: ["Login próprio", "Alterar senha", "Autenticação rápida por crachá"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "OPERACAO", permissoes: ["Login próprio via dispositivo móvel", "Autenticação rápida no início de turno"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "OPERACAO", permissoes: ["Login vinculado à linha/posto de trabalho", "Troca rápida de operador"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Qualquer Usuário",
        acaoUsuario: "Insere matrícula/e-mail e senha, ou aproxima crachá/QR Code no leitor biométrico/câmera.",
        respostaSistema: "Valida hash bcrypt da credencial e verifica status 'Ativo' no banco de dados.",
        validacoes: ["Credenciais válidas", "Usuário ativo", "Conta não bloqueada por excesso de tentativas"]
      },
      {
        passo: 2,
        ator: "Sistema",
        acaoUsuario: "N/A (Processamento interno)",
        respostaSistema: "Emite JWT (JSON Web Token) assinado com RSA-256 contendo Claims (sub, role, linhaId, postoId, exp: 8h).",
        validacoes: ["Validade da assinatura do token", "Expiração da sessão"]
      },
      {
        passo: 3,
        ator: "Frontend",
        acaoUsuario: "Armazena token em Secure HTTP-Only Cookie ou Storage seguro com chave de rotação.",
        respostaSistema: "Redireciona para o painel contextual específico do perfil (ex: Abastecedor cai direto na fila móvel).",
        validacoes: ["Guardas de rota (React Protected Routes)"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Tela de Login",
        campos: [
          { nome: "identificador", tipo: "String", obrigatorio: true, descricao: "Matrícula, Crachá ou E-mail corporativo" },
          { nome: "senha", tipo: "Password", obrigatorio: true, descricao: "Senha alfanumérica mínima de 8 caracteres" },
          { nome: "linhaPostoInicial", tipo: "Select (Opcional)", obrigatorio: false, descricao: "Posto físico onde o operador está assumindo turno" }
        ],
        elementosVisuais: ["Botão de Login com Senha", "Botão 'Bipar Crachá / QR Code'", "Seletor de Idioma", "Versão do App"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "AUTH_LOGIN_SUCCESS",
        gatilho: "Login realizado com sucesso",
        destinatarios: ["Logs de Auditoria"],
        canal: "TOAST",
        payloadExemplo: "{ userId: 'USR-08', timestamp: '2026-09-08T08:00:00Z', ip: '192.168.1.45', device: 'Zebra TC26' }"
      },
      {
        evento: "AUTH_LOGIN_FAILED_3X",
        gatilho: "3 tentativas inválidas consecutivas",
        destinatarios: ["ADMIN", "GESTOR"],
        canal: "WEBSOCKET",
        payloadExemplo: "{ userId: 'USR-08', alert: 'Conta bloqueada temporariamente por 15 min' }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-AUTH-01", titulo: "Sessão Concorrente", regra: "Não é permitido o mesmo operador logado simultaneamente em dois postos físicos distintos.", tratativaExcecao: "O sistema desloga automaticamente a sessão anterior e emite aviso." },
      { codigo: "RN-AUTH-02", titulo: "Expiração por Inatividade", regra: "Em terminais de quiosque de produção, inatividade de 10 minutos bloqueia a tela exigindo re-autenticação rápida.", tratativaExcecao: "Exibe overlay de PIN rápido de 4 dígitos para desbloqueio." }
    ]
  },
  {
    id: "mod-02",
    numero: 2,
    nome: "Dashboard Operacional em Tempo Real",
    icone: "LayoutDashboard",
    descricaoCurta: "Painel de controle visual com KPIs logísticos, gráfico de fluxo de status, Lead Time de reabastecimento e alertas em tempo real.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Visualização global", "Configuração de metas e SLAs"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "TOTAL", permissoes: ["Visualização completa", "Filtros por linha/turno", "Exportação de KPIs"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "OPERACAO", permissoes: ["Visualização da fila de separação e taxa de expedição"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "OPERACAO", permissoes: ["Visualização de metas de entregas do turno e ordens pendentes"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "LEITURA", permissoes: ["Visualização do status da sua linha específica"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Sistema (Background)",
        acaoUsuario: "N/A",
        respostaSistema: "Agrega em memória e banco de dados métricas operacionais a cada transição de status (Redis Pub/Sub / WebSocket).",
        validacoes: ["Consistência cronológica dos timestamps"]
      },
      {
        passo: 2,
        ator: "Gestor / Usuário",
        acaoUsuario: "Acessa a tela de Dashboard e seleciona filtros de período (Turno Atual, Hoje, Últimos 7 dias) e Linha.",
        respostaSistema: "Renderiza cartões de métricas, gráfico de barras com distribuição de status, e velocímetro de SLA.",
        validacoes: ["Permissão de escopo de visualização da linha"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Cartões de Indicadores Chave (KPIs)",
        campos: [
          { nome: "taxaSLA_OTIF", tipo: "Percentual", obrigatorio: true, descricao: "On-Time In-Full: % de solicitações atendidas dentro do SLA da urgência" },
          { nome: "tempoMedioCiclo", tipo: "Minutos", obrigatorio: true, descricao: "Lead Time total: Desde o clique da produção até a confirmação de recebimento" },
          { nome: "solicitacoesAtivas", tipo: "Inteiro", obrigatorio: true, descricao: "Total de ordens em andamento no chão de fábrica no momento" },
          { nome: "alertasCriticos", tipo: "Inteiro", obrigatorio: true, descricao: "Quantidade de chamados com risco de Linha Parada ou atraso de SLA" }
        ],
        elementosVisuais: ["Gráfico de Pipeline de Abastecimento (6 fases)", "Gráfico de Consumo por Linha", "Feed de Alertas em Tempo Real"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "KPI_SLA_BREACH_WARNING",
        gatilho: "SLA global do turno cai abaixo de 92%",
        destinatarios: ["GESTOR"],
        canal: "PUSH_MOBILE",
        payloadExemplo: "{ currentSla: 91.4, target: 95.0, pendingUrgentCount: 4 }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-DASH-01", titulo: "Cálculo de Lead Time", regra: "Lead Time = Timestamp(Produção Confirma) - Timestamp(Produção Solicita). Pedidos suspensos por falta de material congelam o cronômetro com log justificado.", tratativaExcecao: "Gravação de delta congelado na tabela de ocorrências." }
    ]
  },
  {
    id: "mod-03",
    numero: 3,
    nome: "Solicitação de Materiais (Interface Chão de Fábrica)",
    icone: "PlusCircle",
    descricaoCurta: "Interface rápida e touch-friendly para o operador requisitar matérias-primas e componentes para seu posto de trabalho.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Criar solicitações em nome de qualquer posto", "Cancelar chamados"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "TOTAL", permissoes: ["Autorizar requisições especiais fora de cota"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "LEITURA", permissoes: ["Visualizar solicitações recebidas"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "LEITURA", permissoes: ["Visualizar solicitações atribuídas"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "OPERACAO", permissoes: ["Nova solicitação", "Cancelar solicitação antes do aceite"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Operador de Produção",
        acaoUsuario: "Clica em 'Nova Solicitação' e bipa o código do posto ou seleciona Linha e Posto pré-definidos.",
        respostaSistema: "Pré-carrega a lista de materiais cadastrados e compatíveis com aquele posto de trabalho (BOM / Roteiro).",
        validacoes: ["Posto ativo", "Operador vinculado"]
      },
      {
        passo: 2,
        ator: "Operador de Produção",
        acaoUsuario: "Seleciona o Material, digita a quantidade desejada, escolhe o nível de urgência (Normal, Urgente, Crítico) e clica em 'Salvar'.",
        respostaSistema: "Gera número sequencial de ordem (ex: SOL-2026-0841), cria registro com status 'SOLICITADO' e envia push instantâneo ao estoque.",
        validacoes: ["Quantidade > 0", "Saldo em estoque disponível", "Limite máximo por lote"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Formulário de Nova Solicitação",
        campos: [
          { nome: "linhaProducao", tipo: "Select/FK", obrigatorio: true, descricao: "Linha onde o material será consumido" },
          { nome: "postoTrabalho", tipo: "Select/FK", obrigatorio: true, descricao: "Posto físico exato de entrega" },
          { nome: "material", tipo: "Autocomplete / QR Code", obrigatorio: true, descricao: "Código e descrição do componente requisitado" },
          { nome: "quantidade", tipo: "Numérico Positivo", obrigatorio: true, descricao: "Volume na unidade de medida (UN, KG, CX)" },
          { nome: "urgencia", tipo: "Radio Group", obrigatorio: true, descricao: "Normal (30 min), Urgente (15 min), Crítico / Linha Parada (< 5 min)" },
          { nome: "observacao", tipo: "Textarea", obrigatorio: false, descricao: "Instruções específicas para o manuseio ou acondicionamento" }
        ],
        elementosVisuais: ["Teclado numérico ampliado para toque com luvas", "Indicador de estoque disponível em tempo real", "Botão de Leitura de QR Code"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "REQ_CREATED",
        gatilho: "Operador conclui o envio da solicitação",
        destinatarios: ["ESTOQUISTA", "GESTOR"],
        canal: "WEBSOCKET",
        payloadExemplo: "{ ordem: 'SOL-2026-0841', linha: 'Linha 1', posto: 'P-02', material: 'MAT-4029', urgencia: 'CRITICO' }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-SOL-01", titulo: "Duplicidade de Pedidos", regra: "Não é permitido abrir nova solicitação para o mesmo material no mesmo posto se já houver chamado em aberto com menos de 10 minutos.", tratativaExcecao: "Sistema alerta: 'Já existe solicitação pendente SOL-xxxx para este posto'." },
      { codigo: "RN-SOL-02", titulo: "SLA Dinâmico por Urgência", regra: "Normal: SLA 30 min; Urgente: SLA 15 min; Crítico: SLA 5 min com sirene visual no almoxarifado.", tratativaExcecao: "Disparo automático de alarme visual e sonoro no quiosque do estoque." }
    ]
  },
  {
    id: "mod-04",
    numero: 4,
    nome: "Gestão de Estoque e Localização Física",
    icone: "Boxes",
    descricaoCurta: "Visualização do saldo em tempo real, endereçamento de estoque (Corredor, Rua, Prateleira, Nível) e separação de lotes (Picking).",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Ajuste de inventário", "Cadastro de endereços", "Mapeamento"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "TOTAL", permissoes: ["Relatório de curva ABC", "Acuracidade de estoque"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "OPERACAO", permissoes: ["Aceitar requisição", "Separar material", "Reservar saldo", "Confirmar lote"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "LEITURA", permissoes: ["Consultar endereço de retirada"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "LEITURA", permissoes: ["Consultar saldo disponível antes do pedido"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Estoquista",
        acaoUsuario: "Acessa fila de separação, visualiza nova ordem e clica no botão 'Aceitar'.",
        respostaSistema: "Muda status para 'RECEBIDO_ESTOQUE', bloqueia a ordem para outros operadores e exibe o mapa de endereçamento do material (Ex: Rua A, Prateleira 03, Nível 2).",
        validacoes: ["Ordem ainda não aceita por outro estoquista"]
      },
      {
        passo: 2,
        ator: "Estoquista",
        acaoUsuario: "Vai até a posição, coleta os itens, clica em 'Escanear Código' e bipa o QR Code do lote do material.",
        respostaSistema: "Valida conferência cega (código do material conferido com a solicitação), reserva o saldo e clica em 'Salvar Separação'.",
        validacoes: ["Código bipado corresponde ao material solicitado", "Quantidade bate com o lote"]
      },
      {
        passo: 3,
        ator: "Sistema",
        acaoUsuario: "N/A",
        respostaSistema: "Altera status da ordem para 'MATERIAL_SEPARADO', debita saldo provisório e disponibiliza para a fila dos Abastecedores.",
        validacoes: ["Atualização atômica de estoque"]
      },
      {
        passo: 4,
        ator: "Estoquista / Gestor / Admin",
        acaoUsuario: "Clica em 'Lançar Estoque Manual', seleciona Material, Natureza (Entrada +, Saída - ou Ajuste =), quantidade, lote, NF/doc e motivo detalhado.",
        respostaSistema: "Calcula prévia em tempo real, valida saldo não-negativo, atualiza saldo do material, grava no Kardex de movimentações e gera log de auditoria.",
        validacoes: ["Material válido", "Quantidade positiva", "Saldo suficiente para saída", "Motivo/justificativa obrigatório"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Ficha de Endereçamento do Material",
        campos: [
          { nome: "codigoMaterial", tipo: "String", obrigatorio: true, descricao: "SKU do componente" },
          { nome: "descricao", tipo: "String", obrigatorio: true, descricao: "Nomenclatura técnica" },
          { nome: "enderecoFisico", tipo: "String", obrigatorio: true, descricao: "Corredor - Rua - Prateleira - Nível (Ex: ALM-A-03-N2)" },
          { nome: "saldoDisponivel", tipo: "Numérico", obrigatorio: true, descricao: "Saldo livre para separação" },
          { nome: "saldoReservado", tipo: "Numérico", obrigatorio: true, descricao: "Itens já alocados em ordens abertas" },
          { nome: "estoqueMinimo", tipo: "Numérico", obrigatorio: true, descricao: "Ponto de ressuprimento" }
        ],
        elementosVisuais: ["Badge de status de estoque (Verde: Normal, Amarelo: Atenção, Vermelho: Ruptura)", "Mini-mapa da rua do almoxarifado"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "STOCK_RESERVED",
        gatilho: "Estoquista aceita e separa o lote",
        destinatarios: ["ABASTECEDOR", "OPERADOR_PRODUCAO"],
        canal: "WEBSOCKET",
        payloadExemplo: "{ ordem: 'SOL-2026-0841', status: 'MATERIAL_SEPARADO', stagingArea: 'Doca 02' }"
      },
      {
        evento: "STOCK_MINIMUM_TRIGGERED",
        gatilho: "Saldo disponível cai abaixo do estoque de segurança",
        destinatarios: ["GESTOR", "COMPRAS"],
        canal: "TOAST",
        payloadExemplo: "{ materialId: 'MAT-4029', saldo: 12, estoqueMinimo: 50 }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-EST-01", titulo: "Prevenção de Furo de Estoque", regra: "Não é permitido separar quantidade superior ao saldo físico disponível. Se faltar saldo, aciona botão 'Informar Problema'.", tratativaExcecao: "Ordem é colocada em 'COM_PROBLEMA' e compras/gestão é notificada." },
      { codigo: "RN-EST-02", titulo: "Validação Obrigatória de Lote (FIFO/FEFO)", regra: "O sistema obriga a leitura do lote mais antigo em estoque (FIFO). Lotes divergentes exigem justificativa do gestor.", tratativaExcecao: "Bloqueio de tela exigindo PIN de liberação do Gestor." },
      { codigo: "RN-EST-03", titulo: "Rastreabilidade de Lançamentos Manuais de Estoque", regra: "Todo lançamento manual (entrada, saída por avaria/descarte ou ajuste de inventário) exige identificação do operador, tipo de operação, motivo documentado e gera registro imutável no Extrato Kardex e Trilha de Auditoria.", tratativaExcecao: "Bloqueio do formulário se o campo de justificativa estiver vazio ou se saída exceder saldo atual." }
    ]
  },
  {
    id: "mod-05",
    numero: 5,
    nome: "Rastreamento de Abastecimentos em Tempo Real",
    icone: "Truck",
    descricaoCurta: "Acompanhamento visual e transparente do fluxo físico: quem está transportando, onde está a carga e estimativa de chegada.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Reatribuir abastecedores", "Intervir em ordens travadas"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "TOTAL", permissoes: ["Visão em tempo real da frota e ordens em trânsito"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "LEITURA", permissoes: ["Confirmar que o abastecedor retirou a carga"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "OPERACAO", permissoes: ["Iniciar transporte", "Confirmar entrega no posto", "Informar problema"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "OPERACAO", permissoes: ["Confirmar recebimento", "Finalizar solicitação"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Abastecedor",
        acaoUsuario: "Visualiza material separado na Staging Area, clica em 'Iniciar' no seu dispositivo móvel.",
        respostaSistema: "Registra timestamp de saída, vincula o ID do abastecedor e muda status para 'EM_TRANSPORTE'.",
        validacoes: ["Ordem em status MATERIAL_SEPARADO"]
      },
      {
        passo: 2,
        ator: "Abastecedor",
        acaoUsuario: "Desloca-se até a linha de produção, descarrega no posto e clica em 'Escanear Código' do posto ou 'Confirmar Entrega'.",
        respostaSistema: "Valida geolocalização / leitura do QR Code do Posto (Ex: LOC-L1-P02) e muda status para 'ENTREGA_REALIZADA'.",
        validacoes: ["QR Code bipado confere com o posto de destino"]
      },
      {
        passo: 3,
        ator: "Operador de Produção",
        acaoUsuario: "Inspeciona o material recebido e clica em 'Confirmar Entrega' / 'Finalizar' no terminal do seu posto.",
        respostaSistema: "Grava timestamp de encerramento, fecha o Lead Time, calcula o SLA atingido e move a solicitação para 'FINALIZADA'.",
        validacoes: ["Status anterior = ENTREGA_REALIZADA"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Visão Geral da Ordem de Abastecimento",
        campos: [
          { nome: "numeroOrdem", tipo: "String", obrigatorio: true, descricao: "Identificador unívoco da ordem" },
          { nome: "statusAtual", tipo: "Badge Colorido", obrigatorio: true, descricao: "Etapa corrente do fluxo" },
          { nome: "responsavelAtual", tipo: "String", obrigatorio: true, descricao: "Nome e papel do usuário manipulando o pedido" },
          { nome: "localizacaoOrigemDestino", tipo: "String", obrigatorio: true, descricao: "De: Almoxarifado Central → Para: Linha 1 / Posto P-02" },
          { nome: "cronometroSLA", tipo: "Contador Regressivo", obrigatorio: true, descricao: "Tempo restante até estourar o SLA" }
        ],
        elementosVisuais: ["Linha do Tempo Visual Interativa (6 etapas)", "Barra de Progresso com Transição Suave", "Modal de Detalhes da Movimentação"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "DELIVERY_ARRIVED",
        gatilho: "Abastecedor clica em 'Confirmar Entrega'",
        destinatarios: ["OPERADOR_PRODUCAO"],
        canal: "PUSH_MOBILE",
        payloadExemplo: "{ ordem: 'SOL-2026-0841', status: 'ENTREGA_REALIZADA', msg: 'Material entregue no posto P-02. Favor conferir e finalizar.' }"
      },
      {
        evento: "REQUEST_COMPLETED",
        gatilho: "Produção confirma recebimento final",
        destinatarios: ["GESTOR", "ESTOQUISTA", "ABASTECEDOR"],
        canal: "WEBSOCKET",
        payloadExemplo: "{ ordem: 'SOL-2026-0841', status: 'FINALIZADA', leadTimeMinutos: 11.4 }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-TRA-01", titulo: "Dupla Checagem de Entrega", regra: "A ordem só é finalizada após o clique do Operador de Produção. Caso o operador não confirme em até 15 minutos pós-entrega, o sistema emite alerta ao Gestor.", tratativaExcecao: "Notificação pendente de aceite em aberto." },
      { codigo: "RN-TRA-02", titulo: "Roteirização e Carga Múltipla", regra: "Um abastecedor pode agrupar até 5 ordens simultâneas em seu reboque/carrinho para a mesma linha de produção.", tratativaExcecao: "O sistema organiza a rota por ordem física de postos." }
    ]
  },
  {
    id: "mod-06",
    numero: 6,
    nome: "Módulo de Cadastros Mestres",
    icone: "FolderGit2",
    descricaoCurta: "Manutenção de cadastros essenciais: Materiais, Linhas de Produção, Postos de Trabalho e Usuários do sistema.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Cadastrar", "Editar", "Excluir (soft delete)", "Importar CSV"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "OPERACAO", permissoes: ["Cadastrar postos", "Ajustar parâmetros de linhas", "Vincular operadores"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "LEITURA", permissoes: ["Consultar materiais e localizações"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "LEITURA", permissoes: ["Consultar postos e linhas"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "LEITURA", permissoes: ["Consultar materiais permitidos na sua linha"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Administrador / Gestor",
        acaoUsuario: "Acessa a aba de Cadastros, escolhe a entidade desejada (Materiais / Linhas / Postos / Usuários) e clica em 'Salvar' ou 'Editar'.",
        respostaSistema: "Valida regras de integridade relacional, unicidade de código e formatação dos campos.",
        validacoes: ["Código único", "Chave estrangeira válida", "Nome preenchido"]
      },
      {
        passo: 2,
        ator: "Sistema",
        acaoUsuario: "N/A",
        respostaSistema: "Persiste dados no banco relacional, gera payload de QR Code automaticamente para a nova entidade e registra log de auditoria.",
        validacoes: ["Geração do hash do QR Code sem conflito"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Tabelas de Gerenciamento",
        campos: [
          { nome: "codigo", tipo: "Alfanumérico Único", obrigatorio: true, descricao: "Identificador mestre da entidade" },
          { nome: "nomeDescricao", tipo: "Texto", obrigatorio: true, descricao: "Nome legível por humanos" },
          { nome: "parametrosEspecificos", tipo: "Campos Específicos", obrigatorio: true, descricao: "Saldo, Endereço, Postos vinculados, Perfil de acesso" }
        ],
        elementosVisuais: ["Botões Salvar, Editar, Excluir", "Campo de Busca Dinâmica", "Filtro por Categoria e Status"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "MASTER_DATA_UPDATED",
        gatilho: "Cadastro de material ou posto é modificado",
        destinatarios: ["TODOS"],
        canal: "WEBSOCKET",
        payloadExemplo: "{ entity: 'MATERIAL', action: 'UPDATE', id: 'MAT-4029' }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-CAD-01", titulo: "Soft Delete Obrigatório", regra: "Materiais, linhas ou postos que possuam histórico de movimentações nunca podem ser apagados fisicamente (Hard Delete), apenas inativados.", tratativaExcecao: "Se houver histórico, botão Excluir executa Inativação lógica." }
    ]
  },
  {
    id: "mod-07",
    numero: 7,
    nome: "Identificação por QR Code e Código de Barras",
    icone: "QrCode",
    descricaoCurta: "Mecanismo de captura rápida por câmera ou coletor de dados óptico (Zebra/Honeywell) para materiais, caixas e postos.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Configurar padrões de código", "Imprimir etiquetas"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "OPERACAO", permissoes: ["Reimprimir etiquetas danificadas"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "OPERACAO", permissoes: ["Escanear endereço de estante e lote de material"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "OPERACAO", permissoes: ["Escanear código do posto no momento da entrega"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "OPERACAO", permissoes: ["Escanear código do kanban para abertura rápida de pedido"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Qualquer Operador",
        acaoUsuario: "Clica no botão 'Escanear Código' presente nas telas contextuais.",
        respostaSistema: "Abre leitor de câmera com mira de enquadramento (ou ativa modo escuta no leitor laser embutido do coletor).",
        validacoes: ["Permissão de acesso à câmera no navegador/OS"]
      },
      {
        passo: 2,
        ator: "Operador",
        acaoUsuario: "Aponta a câmera para a etiqueta física ou bipa o gatilho laser do terminal.",
        respostaSistema: "Decodifica a string (ex: 'MAT-4029|LOTE-2026B|QTD-100'), faz o parse dos delimitadores e valida contra a ordem ativa.",
        validacoes: ["Formato padrão da etiqueta corporativa", "Checksum da etiqueta"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Modal do Scanner",
        campos: [
          { nome: "statusLeitura", tipo: "Visual", obrigatorio: true, descricao: "Mira verde quando identificado, vermelha quando inválido" },
          { nome: "codigoDecodificado", tipo: "Texto", obrigatorio: true, descricao: "Resultado bruto da leitura com confirmação sonora de 'BEEP'" }
        ],
        elementosVisuais: ["Área de vídeo com animação de scanner laser", "Botão de ativação de lanterna/flash", "Entrada manual de fallback"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "QR_SCANNED_MATCH",
        gatilho: "Leitura correta do código esperado",
        destinatarios: ["Interface Local"],
        canal: "TOAST",
        payloadExemplo: "{ code: 'LOC-L1-P02', match: true }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-QR-01", titulo: "Tolerância a Falhas e Digitação Manual", regra: "Em caso de etiqueta rasurada ou câmera sem foco, o sistema deve disponibilizar campo de digitação manual mediante confirmação de matrícula.", tratativaExcecao: "Grava flag 'EntradaManual: true' no log de rastreabilidade." }
    ]
  },
  {
    id: "mod-08",
    numero: 8,
    nome: "Sistema de Alertas e Notificações Multicanal",
    icone: "BellRing",
    descricaoCurta: "Central de alertas em tempo real para ordens com risco de estouro de SLA, linha parada, divergência e estoque crítico.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Configurar regras de disparo e canais de push"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "TOTAL", permissoes: ["Receber todos os alertas operacionais e de emergência"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "OPERACAO", permissoes: ["Receber chamados urgentes e avisos de falta de material"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "OPERACAO", permissoes: ["Receber avisos de ordens prontas para coleta"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "OPERACAO", permissoes: ["Receber notificação de material entregue ou problemas"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Motor de Eventos do Sistema",
        acaoUsuario: "N/A",
        respostaSistema: "Monitora continuamente os prazos das ordens e níveis de estoque em background (Worker em tempo real).",
        validacoes: ["Tempo decorrido vs SLA estipulado"]
      },
      {
        passo: 2,
        ator: "Sistema",
        acaoUsuario: "N/A",
        respostaSistema: "Identifica que uma ordem 'CRITICA' atingiu 80% do SLA sem aceite do estoquista; gera alerta sonoro e badge piscante no painel.",
        validacoes: ["Notificação ainda não emitida no mesmo ciclo"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Central de Notificações",
        campos: [
          { nome: "tipoAlerta", tipo: "Tag", obrigatorio: true, descricao: "Urgência, Atraso, Falta de Material, Problema" },
          { nome: "titulo", tipo: "String", obrigatorio: true, descricao: "Resumo objetivo da ocorrência" },
          { nome: "mensagem", tipo: "Texto", obrigatorio: true, descricao: "Detalhes do posto, material e tempo decorrido" },
          { nome: "timestamp", tipo: "Hora Relativa", obrigatorio: true, descricao: "Ex: 'Há 2 min'" }
        ],
        elementosVisuais: ["Badge numérico no ícone de sino", "Cores de prioridade (Vermelho: Crítico, Laranja: Atraso, Amarelo: Estoque)", "Botão Limpar Lidas"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "ALERT_ESCALATED",
        gatilho: "Ordem crítica parada há mais de 10 min",
        destinatarios: ["GESTOR", "GERENTE_PLANTA"],
        canal: "PUSH_MOBILE",
        payloadExemplo: "{ alertId: 'ALT-992', level: 'CRITICAL', linha: 'Linha 1' }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-NOTIF-01", titulo: "Alerta Andon Visual", regra: "Chamados com nível 'CRITICO_LINHA_PARADA' devem manter tarja vermelha fixa no topo de todas as telas até que sejam aceitos.", tratativaExcecao: "Persistência visual obrigatória no header." }
    ]
  },
  {
    id: "mod-09",
    numero: 9,
    nome: "Histórico Completo e Trilha de Auditoria",
    icone: "History",
    descricaoCurta: "Registro imutável de todas as transações, contendo quem solicitou, quem separou, quem transportou e horários de cada passo.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Acesso irrestrito a logs brutos e exportação forense"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "TOTAL", permissoes: ["Filtrar histórico por data, operador, posto e material"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "LEITURA", permissoes: ["Consultar histórico de separações realizadas por ele"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "LEITURA", permissoes: ["Consultar histórico de transportes concluídos"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "LEITURA", permissoes: ["Consultar requisições anteriores da sua linha"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Sistema",
        acaoUsuario: "Qualquer ação efetuada por qualquer usuário.",
        respostaSistema: "Cria registro de log estruturado imutável contendo (id, timestamp, userId, papel, ação, entidade, estadoAnterior, novoEstado, ip, device).",
        validacoes: ["Imutabilidade dos dados históricos (Append-Only)"]
      },
      {
        passo: 2,
        ator: "Gestor / Auditor",
        acaoUsuario: "Acessa a tela de Histórico, digita código de ordem ou filtra por intervalo de datas.",
        respostaSistema: "Retorna a linha do tempo completa do chamado com cada timestamp e operador responsável.",
        validacoes: ["Permissão de leitura histórica"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Grid de Histórico e Auditoria",
        campos: [
          { nome: "timestamp", tipo: "Data e Hora Completa", obrigatorio: true, descricao: "Data e hora com precisão de segundos" },
          { nome: "numeroOrdem", tipo: "Link", obrigatorio: true, descricao: "Acesso à ficha completa da solicitação" },
          { nome: "acaoExecutada", tipo: "String", obrigatorio: true, descricao: "Ex: SEPARAR_LOTE, INICIAR_TRANSPORTE, CONFIRMAR_RECEBIMENTO" },
          { nome: "usuarioResponsavel", tipo: "String + Matrícula", obrigatorio: true, descricao: "Nome e crachá do colaborador" },
          { nome: "detalhesTransacao", tipo: "Texto/JSON", obrigatorio: false, descricao: "Lote utilizado, observações e problemas registrados" }
        ],
        elementosVisuais: ["Tabela com ordenação e paginação", "Exportador para CSV e Excel", "Drawer de Detalhes da Linha do Tempo"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "AUDIT_LOG_APPENDED",
        gatilho: "Qualquer transição de estado no banco de dados",
        destinatarios: ["Log Warehouse / SIEM"],
        canal: "WEBSOCKET",
        payloadExemplo: "{ logId: 'LOG-7721', event: 'CONFIRM_DELIVERY', user: 'USR-08' }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-HIST-01", titulo: "Imutabilidade de Registros", regra: "Nenhum usuário (inclusive o Administrador) possui autorização para alterar ou expurgar registros da tabela de auditoria e movimentações.", tratativaExcecao: "Tabela possui apenas permissões de INSERT e SELECT no SGBD." }
    ]
  },
  {
    id: "mod-10",
    numero: 10,
    nome: "Relatórios e Indicadores de Desempenho",
    icone: "FileBarChart",
    descricaoCurta: "Métricas gerenciais consolidadas, relatórios de Lead Time por turno, ranking de consumo e análise de causas-raiz de problemas.",
    perfisAcesso: [
      { perfil: "ADMIN", perfilLabel: "Administrador", nivel: "TOTAL", permissoes: ["Configurar queries analíticas e agendamento de relatórios"] },
      { perfil: "GESTOR", perfilLabel: "Gestor", nivel: "TOTAL", permissoes: ["Gerar relatórios, gráficos comparativos e análises de Pareto"] },
      { perfil: "ESTOQUISTA", perfilLabel: "Estoquista", nivel: "RESTRITO", permissoes: ["Relatório de produtividade de separação própria"] },
      { perfil: "ABASTECEDOR", perfilLabel: "Abastecedor", nivel: "RESTRITO", permissoes: ["Relatório de viagens e entregas realizadas"] },
      { perfil: "OPERADOR_PRODUCAO", perfilLabel: "Operador de Produção", nivel: "RESTRITO", permissoes: ["Relatório de atendimento da linha"] }
    ],
    fluxoDados: [
      {
        passo: 1,
        ator: "Gestor",
        acaoUsuario: "Seleciona o tipo de relatório (Ex: Relatório de Cumprimento de SLA por Linha), define filtros e clica em 'Pesquisar'.",
        respostaSistema: "Executa agregação analítica no banco de dados e exibe dashboard visual com gráficos de barras, pizza e tabela resumida.",
        validacoes: ["Intervalo de datas válido (máximo 1 ano)"]
      },
      {
        passo: 2,
        ator: "Gestor",
        acaoUsuario: "Clica em 'Exportar Relatório' (PDF ou Excel/CSV).",
        respostaSistema: "Gera arquivo estruturado com cabeçalho oficial da empresa, carimbo de data/hora e assinatura do emissor.",
        validacoes: ["Geração do arquivo no cliente/servidor"]
      }
    ],
    informacoesExibidas: [
      {
        categoria: "Relatórios Analíticos Disponíveis",
        campos: [
          { nome: "relatorioOTIF", tipo: "Métrica / Tabela", obrigatorio: true, descricao: "On-Time In-Full por linha e por turno fabril" },
          { nome: "leadTimeEtapa", tipo: "Gráfico de Linha", obrigatorio: true, descricao: "Tempo médio gasto em: Separação, Transporte e Confirmação" },
          { nome: "paretoMateriaisMaisSolicitados", tipo: "Gráfico de Pareto", obrigatorio: true, descricao: "Curva ABC de componentes mais requisitados" },
          { nome: "relatorioOcorrenciasProblemas", tipo: "Gráfico de Pizza", obrigatorio: true, descricao: "Distribuição dos motivos de parada ou problemas informados" }
        ],
        elementosVisuais: ["Filtros por Período e Turno (1º, 2º e 3º turno)", "Botões de Download Excel/CSV/PDF"]
      }
    ],
    eventosNotificacoes: [
      {
        evento: "REPORT_GENERATED",
        gatilho: "Emissão de relatório gerencial",
        destinatarios: ["GESTOR"],
        canal: "TOAST",
        payloadExemplo: "{ reportType: 'SLA_LINE_BREAKDOWN', recordsFound: 1420 }"
      }
    ],
    regrasNegocio: [
      { codigo: "RN-REL-01", titulo: "Consistência de Turnos", regra: "Os cálculos devem respeitar o calendário de turnos da fábrica: 1º Turno (06h às 14h), 2º Turno (14h às 22h), 3º Turno (22h às 06h).", tratativaExcecao: "Ajuste automático de agrupamento por turno nos relatórios." }
    ]
  }
];

export const SYSTEM_ACTIONS_CATALOG: ActionDefinition[] = [
  {
    nome: "Nova solicitação",
    icone: "PlusCircle",
    cor: "bg-blue-600 hover:bg-blue-700 text-white",
    ondeAparece: ["Tela Principal da Produção", "Header Rápido", "Visão do Operador"],
    perfisAutorizados: ["OPERADOR_PRODUCAO", "GESTOR", "ADMIN"],
    comportamentoEsperado: "Abre o modal de solicitação rápida pré-preenchido com a Linha e Posto do operador logado.",
    requisitosPreAcao: ["Usuário logado", "Posto ativo", "Existência de materiais cadastrados"],
    retornoSistema: "Gera ordem sequencial (ex: SOL-2026-0841), aciona WebSockets do Almoxarifado e exibe toast de confirmação."
  },
  {
    nome: "Salvar",
    icone: "Save",
    cor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    ondeAparece: ["Formulários de Cadastro", "Modal de Nova Solicitação", "Edição de Perfil"],
    perfisAutorizados: ["ADMIN", "GESTOR", "ESTOQUISTA", "ABASTECEDOR", "OPERADOR_PRODUCAO"],
    comportamentoEsperado: "Valida todos os campos obrigatórios e persiste as alterações no banco de dados.",
    requisitosPreAcao: ["Campos preenchidos sem erros de validação", "Formulário dirty"],
    retornoSistema: "Retorna confirmação visual verde com animação e fecha ou atualiza a tela corrente."
  },
  {
    nome: "Editar",
    icone: "Edit3",
    cor: "bg-slate-700 hover:bg-slate-800 text-white",
    ondeAparece: ["Listagens de Cadastros", "Solicitações Pendentes (antes do aceite)", "Tabelas de Itens"],
    perfisAutorizados: ["ADMIN", "GESTOR", "OPERADOR_PRODUCAO"],
    comportamentoEsperado: "Habilita os campos do registro para modificação ou abre o modal com valores carregados.",
    requisitosPreAcao: ["Para solicitações: status ainda deve ser 'SOLICITADO'", "Registro não bloqueado"],
    retornoSistema: "Coloca a interface em modo de edição com botões 'Salvar' e 'Cancelar'."
  },
  {
    nome: "Excluir",
    icone: "Trash2",
    cor: "bg-rose-600 hover:bg-rose-700 text-white",
    ondeAparece: ["Listagens de Cadastros (Materiais, Linhas, Postos, Usuários)", "Solicitações Não Iniciadas"],
    perfisAutorizados: ["ADMIN", "GESTOR"],
    comportamentoEsperado: "Exibe diálogo modal de confirmação irreversível ('Tem certeza que deseja inativar/remover?').",
    requisitosPreAcao: ["Confirmação explícita no diálogo modal", "Verificação de dependências em aberto"],
    retornoSistema: "Executa Soft Delete se houver histórico ou remoção física se for registro sem vínculos."
  },
  {
    nome: "Pesquisar",
    icone: "Search",
    cor: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300",
    ondeAparece: ["Todas as telas de listagem, tabelas e visualização de estoque"],
    perfisAutorizados: ["ADMIN", "GESTOR", "ESTOQUISTA", "ABASTECEDOR", "OPERADOR_PRODUCAO"],
    comportamentoEsperado: "Filtra em tempo real (Debounce 300ms) por código do material, número da ordem, posto ou nome.",
    requisitosPreAcao: ["Mínimo de 1 caractere digitado"],
    retornoSistema: "Atualiza instantaneamente a lista visível destacando o texto coincidente."
  },
  {
    nome: "Filtrar",
    icone: "Filter",
    cor: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300",
    ondeAparece: ["Dashboard", "Rastreamento", "Estoque", "Histórico", "Relatórios"],
    perfisAutorizados: ["ADMIN", "GESTOR", "ESTOQUISTA", "ABASTECEDOR", "OPERADOR_PRODUCAO"],
    comportamentoEsperado: "Abre gaveta de filtros avançados por: Linha, Posto, Nível de Urgência, Status, Data e Turno.",
    requisitosPreAcao: ["Nenhum"],
    retornoSistema: "Aplica critérios combinados (AND) e exibe tags dos filtros ativos com botão 'Limpar Filtros'."
  },
  {
    nome: "Aceitar",
    icone: "CheckSquare",
    cor: "bg-indigo-600 hover:bg-indigo-700 text-white",
    ondeAparece: ["Fila de Pedidos do Estoquista"],
    perfisAutorizados: ["ESTOQUISTA", "ADMIN"],
    comportamentoEsperado: "O estoquista assume a responsabilidade pela separação da ordem selecionada.",
    requisitosPreAcao: ["Ordem estar no status 'SOLICITADO'"],
    retornoSistema: "Muda status para 'RECEBIDO_ESTOQUE', bloqueia para outros estoquistas e abre rota de picking."
  },
  {
    nome: "Iniciar",
    icone: "Play",
    cor: "bg-amber-600 hover:bg-amber-700 text-white",
    ondeAparece: ["Fila de Separação (Estoquista) e Fila de Transporte (Abastecedor)"],
    perfisAutorizados: ["ESTOQUISTA", "ABASTECEDOR", "ADMIN"],
    comportamentoEsperado: "Marca o início formal da atividade física (separação de itens ou trânsito do reboque).",
    requisitosPreAcao: ["Para transporte: ordem precisa estar em 'MATERIAL_SEPARADO'"],
    retornoSistema: "Muda status para 'EM_TRANSPORTE', grava timestamp inicial e aciona notificação push."
  },
  {
    nome: "Confirmar entrega",
    icone: "Truck",
    cor: "bg-cyan-600 hover:bg-cyan-700 text-white",
    ondeAparece: ["Dispositivo Móvel do Abastecedor", "Terminal de Linha"],
    perfisAutorizados: ["ABASTECEDOR", "ADMIN"],
    comportamentoEsperado: "Registra que o material foi fisicamente depositado no posto de trabalho da linha.",
    requisitosPreAcao: ["Ordem estar em 'EM_TRANSPORTE'", "Opcional: validação por bipagem do QR Code do posto"],
    retornoSistema: "Muda status para 'ENTREGA_REALIZADA' e aciona chamada visual no terminal do operador de produção."
  },
  {
    nome: "Finalizar",
    icone: "CheckCircle2",
    cor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    ondeAparece: ["Terminal do Operador de Produção", "Painel de Supervisão"],
    perfisAutorizados: ["OPERADOR_PRODUCAO", "GESTOR", "ADMIN"],
    comportamentoEsperado: "O operador atesta que o material recebido está correto e em quantidade adequada.",
    requisitosPreAcao: ["Ordem estar em 'ENTREGA_REALIZADA'"],
    retornoSistema: "Muda status para 'FINALIZADA', grava tempo de ciclo final, calcula SLA e arquiva chamado."
  },
  {
    nome: "Informar problema",
    icone: "AlertTriangle",
    cor: "bg-rose-600 hover:bg-rose-700 text-white",
    ondeAparece: ["Em todas as etapas do fluxo (Operador, Estoquista e Abastecedor)"],
    perfisAutorizados: ["OPERADOR_PRODUCAO", "ESTOQUISTA", "ABASTECEDOR", "GESTOR", "ADMIN"],
    comportamentoEsperado: "Abre modal para descrever a ocorrência (falta de estoque, avaria, posto inacessível, lote errado).",
    requisitosPreAcao: ["Ordem ativa selecionada"],
    retornoSistema: "Muda status da ordem para 'COM_PROBLEMA', congela cálculo de SLA e alerta o Gestor imediatamente."
  },
  {
    nome: "Escanear código",
    icone: "QrCode",
    cor: "bg-purple-600 hover:bg-purple-700 text-white",
    ondeAparece: ["Barra Superior Rápida", "Modal de Separação de Lote", "Tela de Entrega no Posto"],
    perfisAutorizados: ["ESTOQUISTA", "ABASTECEDOR", "OPERADOR_PRODUCAO", "ADMIN"],
    comportamentoEsperado: "Ativa a câmera frontal/traseira ou aguarda leitura do feixe de laser do leitor dedicado.",
    requisitosPreAcao: ["Permissão de câmera concedida ou leitor USB/Bluetooth pareado"],
    retornoSistema: "Decodifica código, valida contra a etapa atual, executa ação associada e emite som de sucesso."
  },
  {
    nome: "Lançar estoque manual",
    icone: "PackagePlus",
    cor: "bg-blue-600 hover:bg-blue-700 text-white",
    ondeAparece: ["Gestão de Estoque & WMS", "Extrato de Kardex", "Card individual do Material"],
    perfisAutorizados: ["ESTOQUISTA", "GESTOR", "ADMIN"],
    comportamentoEsperado: "Registra formalmente entrada, saída avulsa por avaria/descarte ou ajuste de balanço físico.",
    requisitosPreAcao: ["Material selecionado", "Quantidade válida", "Justificativa/motivo preenchido"],
    retornoSistema: "Atualiza o saldo atual em tempo real, gera linha no Kardex, cria registro de auditoria e emite alerta caso atinja nível crítico."
  }
];

export const TECHNICAL_DATA_DICTIONARY = [
  {
    tabela: "solicitacoes_abastecimento",
    descricao: "Tabela mestre de requisições de material contendo ciclo de vida e timestamps",
    campos: [
      { nome: "id", tipo: "UUID", chave: "PK", nulo: false, descricao: "Identificador global da solicitação" },
      { nome: "numero_ordem", tipo: "VARCHAR(30)", chave: "UNIQUE", nulo: false, descricao: "Código formatado (ex: SOL-2026-0841)" },
      { nome: "material_id", tipo: "UUID", chave: "FK", nulo: false, descricao: "Referência à tabela de materiais" },
      { nome: "linha_id", tipo: "UUID", chave: "FK", nulo: false, descricao: "Linha de produção de destino" },
      { nome: "posto_id", tipo: "UUID", chave: "FK", nulo: false, descricao: "Posto físico de trabalho para entrega" },
      { nome: "quantidade_solicitada", tipo: "DECIMAL(10,2)", chave: "-", nulo: false, descricao: "Volume demandado na unidade padrão" },
      { nome: "quantidade_entregue", tipo: "DECIMAL(10,2)", chave: "-", nulo: true, descricao: "Volume efetivamente entregue no posto" },
      { nome: "lote_separado", tipo: "VARCHAR(50)", chave: "-", nulo: true, descricao: "Número de lote coletado no estoque" },
      { nome: "urgencia", tipo: "ENUM", chave: "-", nulo: false, descricao: "'NORMAL', 'URGENTE', 'CRITICO_LINHA_PARADA'" },
      { nome: "status", tipo: "ENUM", chave: "INDEX", nulo: false, descricao: "'SOLICITADO', 'RECEBIDO_ESTOQUE', 'MATERIAL_SEPARADO', 'EM_TRANSPORTE', 'ENTREGA_REALIZADA', 'FINALIZADA', 'COM_PROBLEMA'" },
      { nome: "solicitante_id", tipo: "UUID", chave: "FK", nulo: false, descricao: "Usuário operador que abriu a ordem" },
      { nome: "estoquista_id", tipo: "UUID", chave: "FK", nulo: true, descricao: "Estoquista que separou a mercadoria" },
      { nome: "abastecedor_id", tipo: "UUID", chave: "FK", nulo: true, descricao: "Operador logístico que realizou o transporte" },
      { nome: "data_criacao", tipo: "TIMESTAMPTZ", chave: "-", nulo: false, descricao: "Data e hora de abertura" },
      { nome: "data_recebimento_estoque", tipo: "TIMESTAMPTZ", chave: "-", nulo: true, descricao: "Data e hora do aceite pelo almoxarife" },
      { nome: "data_separacao", tipo: "TIMESTAMPTZ", chave: "-", nulo: true, descricao: "Data e hora em que ficou pronto na doca" },
      { nome: "data_inicio_transporte", tipo: "TIMESTAMPTZ", chave: "-", nulo: true, descricao: "Data e hora em que o carrinho saiu em viagem" },
      { nome: "data_entrega", tipo: "TIMESTAMPTZ", chave: "-", nulo: true, descricao: "Data e hora de descarga no posto" },
      { nome: "data_confirmacao", tipo: "TIMESTAMPTZ", chave: "-", nulo: true, descricao: "Data e hora do fechamento pelo operador" }
    ]
  },
  {
    tabela: "materiais",
    descricao: "Catálogo mestre de peças, componentes e matérias-primas",
    campos: [
      { nome: "id", tipo: "UUID", chave: "PK", nulo: false, descricao: "Identificador único do material" },
      { nome: "codigo", tipo: "VARCHAR(40)", chave: "UNIQUE", nulo: false, descricao: "SKU interno da engenharia (ex: MAT-4029)" },
      { nome: "descricao", tipo: "VARCHAR(255)", chave: "-", nulo: false, descricao: "Descrição técnica completa" },
      { nome: "categoria", tipo: "VARCHAR(100)", chave: "-", nulo: false, descricao: "Família da peça (ex: Fixadores, Eletrônicos, Cabos)" },
      { nome: "unidade_medida", tipo: "VARCHAR(10)", chave: "-", nulo: false, descricao: "UN, KG, CX, RL, M" },
      { nome: "saldo_atual", tipo: "DECIMAL(12,2)", chave: "-", nulo: false, descricao: "Saldo físico disponível no almoxarifado" },
      { nome: "estoque_minimo", tipo: "DECIMAL(12,2)", chave: "-", nulo: false, descricao: "Ponto de pedido / ressuprimento" },
      { nome: "estoque_seguranca", tipo: "DECIMAL(12,2)", chave: "-", nulo: false, descricao: "Estoque amortecedor de variações" },
      { nome: "corredor", tipo: "VARCHAR(20)", chave: "-", nulo: false, descricao: "Corredor ou Rua do almoxarifado" },
      { nome: "prateleira", tipo: "VARCHAR(20)", chave: "-", nulo: false, descricao: "Módulo / Estante" },
      { nome: "nivel", tipo: "VARCHAR(20)", chave: "-", nulo: false, descricao: "Andar físico de armazenagem" },
      { nome: "qrcode_valor", tipo: "VARCHAR(100)", chave: "UNIQUE", nulo: false, descricao: "String padrão impressa na etiqueta" }
    ]
  },
  {
    tabela: "historico_movimentacoes",
    descricao: "Trilha de auditoria append-only para compliance e rastreabilidade total",
    campos: [
      { nome: "id", tipo: "UUID", chave: "PK", nulo: false, descricao: "Identificador único do log" },
      { nome: "solicitacao_id", tipo: "UUID", chave: "FK", nulo: false, descricao: "Ordem relacionada" },
      { nome: "usuario_id", tipo: "UUID", chave: "FK", nulo: false, descricao: "Usuário que executou a ação" },
      { nome: "status_origem", tipo: "VARCHAR(50)", chave: "-", nulo: true, descricao: "Estado antes do evento" },
      { nome: "status_destino", tipo: "VARCHAR(50)", chave: "-", nulo: false, descricao: "Estado resultante após a transação" },
      { nome: "acao", tipo: "VARCHAR(50)", chave: "-", nulo: false, descricao: "Nome da ação (ACEITAR, INICIAR, CONFIRMAR)" },
      { nome: "timestamp", tipo: "TIMESTAMPTZ", chave: "INDEX", nulo: false, descricao: "Carimbo de data/hora do servidor NTP" },
      { nome: "detalhes_json", tipo: "JSONB", chave: "-", nulo: true, descricao: "Payload com lote, ip, dispositivo e observações" }
    ]
  },
  {
    tabela: "kardex_movimentacoes_estoque",
    descricao: "Extrato contínuo de lançamentos manuais e automáticos de estoque (entradas, saídas, avarias e ajustes)",
    campos: [
      { nome: "id", tipo: "UUID", chave: "PK", nulo: false, descricao: "Identificador único do lançamento" },
      { nome: "material_id", tipo: "UUID", chave: "FK", nulo: false, descricao: "Material movimentado" },
      { nome: "tipo", tipo: "VARCHAR(50)", chave: "-", nulo: false, descricao: "ENTRADA_COMPRA, ENTRADA_DEVOLUCAO, SAIDA_AVARIA, SAIDA_DESCARTE, AJUSTE_INVENTARIO" },
      { nome: "natureza", tipo: "ENUM", chave: "INDEX", nulo: false, descricao: "'ENTRADA', 'SAIDA', 'AJUSTE'" },
      { nome: "quantidade", tipo: "DECIMAL(12,2)", chave: "-", nulo: false, descricao: "Volume movimentado" },
      { nome: "saldo_anterior", tipo: "DECIMAL(12,2)", chave: "-", nulo: false, descricao: "Saldo antes da transação" },
      { nome: "saldo_novo", tipo: "DECIMAL(12,2)", chave: "-", nulo: false, descricao: "Saldo resultante após a operação" },
      { nome: "lote", tipo: "VARCHAR(50)", chave: "-", nulo: true, descricao: "Lote físico associado" },
      { nome: "documento_ref", tipo: "VARCHAR(50)", chave: "-", nulo: true, descricao: "Nota Fiscal, OP ou RNC de referência" },
      { nome: "motivo", tipo: "TEXT", chave: "-", nulo: false, descricao: "Justificativa auditável obrigatória" },
      { nome: "responsavel_id", tipo: "UUID", chave: "FK", nulo: false, descricao: "Usuário que operou o lançamento" },
      { nome: "data_hora", tipo: "TIMESTAMPTZ", chave: "-", nulo: false, descricao: "Data e hora do registro" }
    ]
  }
];
