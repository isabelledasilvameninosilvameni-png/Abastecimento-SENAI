import React, { useState } from 'react';
import { 
  SPECIFICATION_MODULES, 
  SYSTEM_ACTIONS_CATALOG, 
  TECHNICAL_DATA_DICTIONARY, 
  SYSTEM_METADATA 
} from '../../data/specificationData';
import { 
  BookOpen, 
  ShieldCheck, 
  Boxes, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Server, 
  QrCode, 
  Bell, 
  History, 
  Activity, 
  Workflow, 
  ArrowRight,
  Code2,
  ListOrdered
} from 'lucide-react';

export const SpecificationViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'VISAO_GERAL' | 'MODULOS' | 'ACOES' | 'DADOS' | 'HARDWARE' | 'APIS'>('VISAO_GERAL');
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedModule = SPECIFICATION_MODULES[selectedModuleIndex];

  const handleCopyMarkdown = () => {
    let md = `# ${SYSTEM_METADATA.nomeSistema}\n\n`;
    md += `**Versão:** ${SYSTEM_METADATA.versao}\n`;
    md += `**Arquitetura:** ${SYSTEM_METADATA.arquitetura}\n\n`;
    md += `## 1. Fluxo Principal de Abastecimento (6 Etapas)\n`;
    md += `Produção solicita ➔ Estoque recebe ➔ Material separado ➔ Abastecedor transporta ➔ Entrega realizada ➔ Produção confirma (Finalizada)\n\n`;
    md += `## 2. Especificação Detalhada dos 10 Módulos\n\n`;

    SPECIFICATION_MODULES.forEach((mod) => {
      md += `### Módulo ${mod.numero}: ${mod.nome}\n`;
      md += `**Descrição:** ${mod.descricaoCurta}\n\n`;
      md += `#### Perfis que Acessam:\n`;
      mod.perfisAcesso.forEach(p => {
        md += `- **${p.perfilLabel} (${p.perfil})**: Nível ${p.nivel}. Permissões: ${p.permissoes.join(', ')}\n`;
      });
      md += `\n#### Fluxo de Dados e Ações:\n`;
      mod.fluxoDados.forEach(f => {
        md += `${f.passo}. **${f.ator}**: ${f.acaoUsuario}\n   - Resposta do Sistema: ${f.respostaSistema}\n   - Validações: ${f.validacoes.join('; ')}\n`;
      });
      md += `\n#### Regras de Negócio:\n`;
      mod.regrasNegocio.forEach(r => {
        md += `- **${r.codigo} - ${r.titulo}**: ${r.regra} *(Exceção: ${r.tratativaExcecao})*\n`;
      });
      md += `\n---\n\n`;
    });

    md += `## 3. Catálogo das 12 Ações Principais do Sistema\n\n`;
    SYSTEM_ACTIONS_CATALOG.forEach(act => {
      md += `### Ação: [${act.nome}]\n`;
      md += `- Onde aparece: ${act.ondeAparece.join(', ')}\n`;
      md += `- Perfis autorizados: ${act.perfisAutorizados.join(', ')}\n`;
      md += `- Comportamento: ${act.comportamentoEsperado}\n`;
      md += `- Retorno do sistema: ${act.retornoSistema}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    let md = `# ESPECIFICAÇÃO TÉCNICA E FUNCIONAL DO SISTEMA DE ABASTECIMENTO DA PRODUÇÃO\n\n`;
    md += `Gerado pelo Arquiteto de Sistemas Logísticos em ${new Date().toISOString()}\n\n`;
    md += `Nome do Sistema: ${SYSTEM_METADATA.nomeSistema}\n`;
    md += `Versão da Arquitetura: ${SYSTEM_METADATA.versao}\n\n`;

    SPECIFICATION_MODULES.forEach((mod) => {
      md += `## MÓDULO ${mod.numero}: ${mod.nome.toUpperCase()}\n\n`;
      md += `### PERFIS COM ACESSO:\n`;
      mod.perfisAcesso.forEach(p => {
        md += `- ${p.perfilLabel}: [${p.nivel}] ${p.permissoes.join(', ')}\n`;
      });
      md += `\n### FLUXO DE DADOS E AÇÕES:\n`;
      mod.fluxoDados.forEach(f => {
        md += `${f.passo}. [${f.ator}] Ação: ${f.acaoUsuario}\n   -> Sistema: ${f.respostaSistema}\n   -> Validações: ${f.validacoes.join('; ')}\n`;
      });
      md += `\n### EVENTOS E NOTIFICAÇÕES:\n`;
      mod.eventosNotificacoes.forEach(e => {
        md += `- Evento: ${e.evento} | Canal: ${e.canal}\n  Gatilho: ${e.gatilho}\n  Payload: ${e.payloadExemplo}\n`;
      });
      md += `\n### REGRAS DE NEGÓCIO:\n`;
      mod.regrasNegocio.forEach(r => {
        md += `- [${r.codigo}] ${r.titulo}: ${r.regra}\n`;
      });
      md += `\n=======================================================\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'especificacao_tecnica_abastecimento_producao.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[750px]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between border-r border-slate-800">
        <div className="space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <span className="text-[10px] font-mono tracking-wider uppercase text-blue-400 font-bold block">
              Documentação de Arquitetura SRS
            </span>
            <h2 className="text-sm font-extrabold text-white mt-1 leading-snug">
              Especificação Técnica de Abastecimento
            </h2>
            <span className="text-[11px] text-slate-400 block mt-0.5">Versão {SYSTEM_METADATA.versao}</span>
          </div>

          <nav className="space-y-1 text-xs">
            <button
              type="button"
              id="spec-nav-visao"
              onClick={() => setActiveSection('VISAO_GERAL')}
              className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center gap-2.5 text-left transition-colors ${
                activeSection === 'VISAO_GERAL' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Workflow className="w-4 h-4" />
              1. Visão Geral & Arquitetura
            </button>

            <button
              type="button"
              id="spec-nav-modulos"
              onClick={() => setActiveSection('MODULOS')}
              className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center gap-2.5 text-left transition-colors ${
                activeSection === 'MODULOS' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Boxes className="w-4 h-4" />
              2. Os 10 Módulos Detalhados
            </button>

            <button
              type="button"
              id="spec-nav-acoes"
              onClick={() => setActiveSection('ACOES')}
              className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center gap-2.5 text-left transition-colors ${
                activeSection === 'ACOES' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              3. Catálogo das 12 Ações & Botões
            </button>

            <button
              type="button"
              id="spec-nav-dados"
              onClick={() => setActiveSection('DADOS')}
              className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center gap-2.5 text-left transition-colors ${
                activeSection === 'DADOS' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Server className="w-4 h-4" />
              4. Modelo de Dados & ERD
            </button>

            <button
              type="button"
              id="spec-nav-hardware"
              onClick={() => setActiveSection('HARDWARE')}
              className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center gap-2.5 text-left transition-colors ${
                activeSection === 'HARDWARE' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <QrCode className="w-4 h-4" />
              5. QR Code, Leitor & Coletores
            </button>

            <button
              type="button"
              id="spec-nav-apis"
              onClick={() => setActiveSection('APIS')}
              className={`w-full px-3 py-2.5 rounded-xl font-semibold flex items-center gap-2.5 text-left transition-colors ${
                activeSection === 'APIS' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Code2 className="w-4 h-4" />
              6. Endpoints REST & WebSockets
            </button>
          </nav>
        </div>

        {/* Action button to export / copy */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado para Área!' : 'Copiar Especificação (.MD)'}
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar Arquivo Completo (.md)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[850px] bg-slate-50/50">
        {/* SECTION 1: VISÃO GERAL */}
        {activeSection === 'VISAO_GERAL' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Capítulo 1</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Visão Geral do Sistema & Arquitetura Logística
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                O <strong>SGA-PROD</strong> é uma plataforma de controle de abastecimento interno industrial concebida para zerar o tempo de parada de linhas de produção decorrente da falta de componentes. Opera no modelo <em>Milk Run Dinâmico</em> e <em>Kanban Eletrônico (e-Kanban)</em>, interligando em tempo real os 5 perfis operacionais com rastreabilidade física de ponta a ponta.
              </p>

              {/* 4 Pilares de Rastreamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Pilar 1</span>
                  <h4 className="text-xs font-bold text-blue-900 mt-1">O que abastecer</h4>
                  <p className="text-[11px] text-blue-800 mt-1">
                    SKU preciso, descrição técnica, lote específico (FIFO) e quantidade exata solicitada pela montagem.
                  </p>
                </div>
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Pilar 2</span>
                  <h4 className="text-xs font-bold text-indigo-900 mt-1">Onde está</h4>
                  <p className="text-[11px] text-indigo-800 mt-1">
                    Endereço de estante no estoque, doca de expedição, rebocador em trânsito e posto final de descarga.
                  </p>
                </div>
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Pilar 3</span>
                  <h4 className="text-xs font-bold text-purple-900 mt-1">Quem realiza</h4>
                  <p className="text-[11px] text-purple-800 mt-1">
                    Identificação inequívoca do solicitante, do separador e do abastecedor em movimento.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Pilar 4</span>
                  <h4 className="text-xs font-bold text-emerald-900 mt-1">Confirmação</h4>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Validação em duas vias: entrega no posto pelo abastecedor e aceite formal pelo operador de produção.
                  </p>
                </div>
              </div>
            </div>

            {/* Fluxograma Sequencial do Abastecimento (6 Fases) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-blue-600" />
                Fluxograma Sequencial Operacional (BPMN / State Machine)
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { passo: '1', ator: 'Operador de Produção', status: 'SOLICITADO', desc: 'Identifica necessidade no posto, abre chamado indicando quantidade e urgência.' },
                  { passo: '2', ator: 'Estoquista', status: 'RECEBIDO_ESTOQUE', desc: 'Aceita a solicitação no almoxarifado, assume a custódia e localiza o endereço na estante.' },
                  { passo: '3', ator: 'Estoquista', status: 'MATERIAL_SEPARADO', desc: 'Coleta o material, bipa o lote físico e disponibiliza o volume na Doca de Expedição.' },
                  { passo: '4', ator: 'Abastecedor', status: 'EM_TRANSPORTE', desc: 'Embarca a mercadoria no carrinho/rebocador elétrico e inicia a rota fabril.' },
                  { passo: '5', ator: 'Abastecedor', status: 'ENTREGA_REALIZADA', desc: 'Descarrega no posto de trabalho e bipa o código de validação física do posto.' },
                  { passo: '6', ator: 'Operador de Produção', status: 'FINALIZADA', desc: 'Confere a mercadoria entregue e clica em Finalizar, encerrando o ciclo de Lead Time.' }
                ].map((item) => (
                  <div key={item.passo} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {item.passo}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">
                          {item.ator} ➔ <span className="font-mono text-blue-700">{item.status}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matriz RACI dos 5 Perfis */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Matriz de Responsabilidade (RACI) dos 5 Perfis de Usuário
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Etapa / Ação</th>
                      <th className="p-2.5 text-center">Administrador</th>
                      <th className="p-2.5 text-center">Gestor</th>
                      <th className="p-2.5 text-center">Estoquista</th>
                      <th className="p-2.5 text-center">Abastecedor</th>
                      <th className="p-2.5 text-center">Operador Prod.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-medium">Solicitar Material no Posto</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">A</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">A</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50">R (Executor)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Aceitar e Separar Lote (Estoque)</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">A</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50">R (Executor)</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Transportar Carga (Milk Run)</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">A</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50">R (Executor)</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Confirmar Entrega no Posto</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">A</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50">R (Executor)</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Confirmar Recebimento / Finalizar</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">A</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">A</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50">R (Executor)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Cadastros & Governança</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 bg-emerald-50">R / A</td>
                      <td className="p-2.5 text-center font-bold text-blue-700">C</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                      <td className="p-2.5 text-center font-bold text-slate-400">I</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 flex gap-4">
                <span><strong>R</strong>: Responsável pela Execução</span>
                <span><strong>A</strong>: Aprovador / Autoridade</span>
                <span><strong>C</strong>: Consultado</span>
                <span><strong>I</strong>: Informado</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: OS 10 MÓDULOS DETALHADOS */}
        {activeSection === 'MODULOS' && (
          <div className="space-y-6">
            {/* Module Picker Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {SPECIFICATION_MODULES.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModuleIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedModuleIndex === idx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Mód {m.numero}: {m.nome.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Selected Module Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  Módulo {selectedModule.numero} de 10
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedModule.nome}</h3>
                <p className="text-xs text-slate-600 mt-1">{selectedModule.descricaoCurta}</p>
              </div>

              {/* Sub-item 1: Perfis que Acessam */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Perfis que Acessam e Matriz de Permissões
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {selectedModule.perfisAcesso.map((p) => (
                    <div key={p.perfil} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{p.perfilLabel}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          p.nivel === 'TOTAL' ? 'bg-purple-100 text-purple-800' :
                          p.nivel === 'OPERACAO' ? 'bg-blue-100 text-blue-800' :
                          p.nivel === 'LEITURA' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.nivel}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-600">
                        <strong>Ações Permitidas:</strong>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                          {p.permissoes.map((perm, i) => (
                            <li key={i}>{perm}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-item 2: Fluxo de Dados e Ações */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-blue-600" />
                  Fluxo de Dados e Ações (Passo a Passo)
                </h4>
                <div className="space-y-3">
                  {selectedModule.fluxoDados.map((f) => (
                    <div key={f.passo} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-blue-700">Passo {f.passo}: Ator - {f.ator}</span>
                      </div>
                      <div className="text-slate-800">
                        <strong>Ação do Usuário:</strong> {f.acaoUsuario}
                      </div>
                      <div className="text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                        <strong>Resposta do Sistema:</strong> {f.respostaSistema}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="font-semibold text-slate-600">Validações:</span>
                        <span>{f.validacoes.join(' • ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-item 3: Informações Exibidas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Informações Exibidas (Campos, Tabelas e Gráficos)
                </h4>
                {selectedModule.informacoesExibidas.map((info, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden mb-3">
                    <div className="bg-slate-100 p-2.5 font-bold text-xs text-slate-800">
                      {info.categoria}
                    </div>
                    <div className="p-3 bg-white space-y-2">
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-400 font-semibold border-b border-slate-100">
                          <tr>
                            <th className="pb-1.5">Campo</th>
                            <th className="pb-1.5">Tipo de Dado</th>
                            <th className="pb-1.5 text-center">Obrigatório</th>
                            <th className="pb-1.5">Descrição / Finalidade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {info.campos.map((c) => (
                            <tr key={c.nome}>
                              <td className="py-1.5 font-mono font-bold text-blue-700">{c.nome}</td>
                              <td className="py-1.5 font-mono text-slate-600">{c.tipo}</td>
                              <td className="py-1.5 text-center">
                                {c.obrigatorio ? (
                                  <span className="text-red-600 font-bold">Sim</span>
                                ) : (
                                  <span className="text-slate-400">Não</span>
                                )}
                              </td>
                              <td className="py-1.5 text-slate-700">{c.descricao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <strong>Componentes Visuais:</strong> {info.elementosVisuais.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-item 4: Eventos e Notificações */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Eventos e Notificações Disparados
                </h4>
                <div className="space-y-2.5">
                  {selectedModule.eventosNotificacoes.map((ev) => (
                    <div key={ev.evento} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {ev.evento}
                        </span>
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                          Canal: {ev.canal}
                        </span>
                      </div>
                      <div className="text-slate-700">
                        <strong>Gatilho de Disparo:</strong> {ev.gatilho} | <strong>Destinatários:</strong> {ev.destinatarios.join(', ')}
                      </div>
                      <pre className="p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                        {ev.payloadExemplo}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-item 5: Regras de Negócio */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Regras de Negócio Aplicáveis (RN)
                </h4>
                <div className="space-y-2">
                  {selectedModule.regrasNegocio.map((rn) => (
                    <div key={rn.codigo} className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-900">{rn.codigo}: {rn.titulo}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{rn.regra}</p>
                      <p className="text-[11px] text-blue-700 italic">
                        <strong>Tratativa de Exceção:</strong> {rn.tratativaExcecao}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: CATÁLOGO DE AÇÕES & BOTÕES */}
        {activeSection === 'ACOES' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Capítulo 3</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Catálogo das 12 Ações Principais da Interface
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Distribuição contextual dos botões e ações no sistema com perfis autorizados, pré-condições e respostas esperadas do motor de regras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {SYSTEM_ACTIONS_CATALOG.map((act) => (
                <div key={act.nome} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${act.cor}`}>
                      {act.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {act.perfisAutorizados.length} perfis autorizados
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium">{act.comportamentoEsperado}</p>

                  <div className="p-2 bg-slate-50 rounded-lg text-[11px] space-y-1 text-slate-600 border border-slate-100">
                    <div>
                      <strong>Onde Aparece:</strong> {act.ondeAparece.join(' • ')}
                    </div>
                    <div>
                      <strong>Perfis Autorizados:</strong> {act.perfisAutorizados.join(', ')}
                    </div>
                    <div>
                      <strong>Pré-requisitos:</strong> {act.requisitosPreAcao.join('; ')}
                    </div>
                    <div className="text-blue-800 font-medium">
                      <strong>Retorno do Sistema:</strong> {act.retornoSistema}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: MODELO DE DADOS & ERD */}
        {activeSection === 'DADOS' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Capítulo 4</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Modelo de Dados & Dicionário de Tabelas
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Schema relacional normalizado para PostgreSQL / Cloud SQL com integridade referencial e índices para baixa latência.
              </p>
            </div>

            <div className="space-y-4">
              {TECHNICAL_DATA_DICTIONARY.map((tab) => (
                <div key={tab.tabela} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-mono font-bold text-sm text-blue-300">{tab.tabela}</h4>
                      <p className="text-xs text-slate-400">{tab.descricao}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {tab.campos.length} colunas
                    </span>
                  </div>
                  <div className="overflow-x-auto p-3">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="pb-2">Coluna</th>
                          <th className="pb-2">Tipo SQL</th>
                          <th className="pb-2 text-center">Chave</th>
                          <th className="pb-2 text-center">Nullable</th>
                          <th className="pb-2">Descrição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tab.campos.map((c) => (
                          <tr key={c.nome}>
                            <td className="py-2 font-mono font-bold text-slate-900">{c.nome}</td>
                            <td className="py-2 font-mono text-blue-700">{c.tipo}</td>
                            <td className="py-2 text-center font-mono font-bold text-purple-700">{c.chave}</td>
                            <td className="py-2 text-center text-slate-500">{c.nulo ? 'NULL' : 'NOT NULL'}</td>
                            <td className="py-2 text-slate-600">{c.descricao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: HARDWARE & SCANNER */}
        {activeSection === 'HARDWARE' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Capítulo 5</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Especificação de Hardware, QR Code & Coletores
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Padrões de codificação óptica, suporte a leitores industriais (Zebra DataWedge / Honeywell Enterprise) e fallback.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  Padrões de Codificação em Etiquetas
                </h4>
                <ul className="space-y-2 text-slate-700">
                  <li className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <strong className="text-blue-700">Material & Lote:</strong>
                    <div className="font-mono text-[11px] mt-0.5">MAT-{`{SKU}`}|LOT-{`{NUMERO_LOTE}`}|QTD-{`{PADRAO}`}</div>
                    <span className="text-[10px] text-slate-500">Ex: MAT-4029|LOT-2026-F88|QTD-100</span>
                  </li>
                  <li className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <strong className="text-blue-700">Posto de Trabalho (Consumo):</strong>
                    <div className="font-mono text-[11px] mt-0.5">LOC-L{`{LINHA}`}-P{`{POSTO}`}</div>
                    <span className="text-[10px] text-slate-500">Ex: LOC-L1-P02 (Fixado na bancada)</span>
                  </li>
                  <li className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <strong className="text-blue-700">Endereço no Almoxarifado:</strong>
                    <div className="font-mono text-[11px] mt-0.5">ALM-{`{CORREDOR}`}-{`{RUA}`}-{`{ESTANTE}`}-{`{NIVEL}`}</div>
                    <span className="text-[10px] text-slate-500">Ex: ALM-A-03-P02-N1</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-600" />
                  Integração com Coletores Rugged
                </h4>
                <div className="space-y-2 text-slate-700">
                  <p>
                    O aplicativo web roda em WebView com suporte ao protocolo de broadcast <strong>DataWedge (Zebra)</strong> e <strong>Honeywell Scanning SDK</strong>.
                  </p>
                  <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px]">
                    <code>window.addEventListener('barcode-scanned', (e) =&gt; handleScan(e.detail.code));</code>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tempo de resposta de decodificação: &lt; 80 milissegundos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: APIS REST & WEBSOCKET */}
        {activeSection === 'APIS' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Capítulo 6</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Contratos de API REST & Eventos WebSocket
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Endpoints para integração com ERP (SAP/TOTVS) e barramento pub/sub para push em tempo real.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  metodo: 'POST',
                  endpoint: '/api/v1/solicitacoes',
                  desc: 'Abertura de nova solicitação pela linha de produção',
                  req: '{\n  "postoId": "pst-02",\n  "materialId": "mat-01",\n  "quantidade": 2,\n  "urgencia": "CRITICO_LINHA_PARADA"\n}',
                  res: '{\n  "id": "req-101",\n  "numeroOrdem": "SOL-2026-0841",\n  "status": "SOLICITADO",\n  "createdAt": "2026-09-08T12:35:00Z"\n}'
                },
                {
                  metodo: 'PATCH',
                  endpoint: '/api/v1/solicitacoes/:id/status',
                  desc: 'Transição atômica de etapa no fluxo com validação de QR Code',
                  req: '{\n  "novoStatus": "EM_TRANSPORTE",\n  "qrCodeValidado": "MAT-4029|LOT-882",\n  "abastecedorId": "usr-04"\n}',
                  res: '{\n  "sucesso": true,\n  "novoStatus": "EM_TRANSPORTE",\n  "timestamp": "2026-09-08T12:40:00Z"\n}'
                }
              ].map((api) => (
                <div key={api.endpoint} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-white ${
                      api.metodo === 'POST' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {api.metodo}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{api.endpoint}</span>
                  </div>
                  <p className="text-slate-600">{api.desc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Payload de Entrada:</span>
                      <pre className="p-2 bg-slate-900 text-slate-200 rounded font-mono text-[11px] overflow-x-auto">{api.req}</pre>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Resposta 200 OK:</span>
                      <pre className="p-2 bg-slate-900 text-emerald-400 rounded font-mono text-[11px] overflow-x-auto">{api.res}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
