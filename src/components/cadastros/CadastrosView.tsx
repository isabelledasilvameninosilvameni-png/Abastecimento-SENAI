import React, { useState } from 'react';
import { Material, ProductionLine, User, WorkStation, UserRole } from '../../types';
import { 
  FolderGit2, 
  Boxes, 
  Layers, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Check, 
  ShieldAlert 
} from 'lucide-react';

interface CadastrosViewProps {
  materials: Material[];
  lines: ProductionLine[];
  users: User[];
  onSaveMaterial: (mat: Material) => void;
  onDeleteMaterial: (id: string) => void;
  onSaveLine: (line: ProductionLine) => void;
  onDeleteLine: (id: string) => void;
  onSaveUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

type TabType = 'MATERIAIS' | 'LINHAS' | 'POSTOS' | 'USUARIOS';

export const CadastrosView: React.FC<CadastrosViewProps> = ({
  materials,
  lines,
  users,
  onSaveMaterial,
  onDeleteMaterial,
  onSaveLine,
  onDeleteLine,
  onSaveUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('MATERIAIS');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'NEW' | 'EDIT'>('NEW');

  // Form states for Material
  const [matForm, setMatForm] = useState<Partial<Material>>({
    codigo: '',
    descricao: '',
    categoria: 'Geral',
    unidadeMedida: 'UN',
    saldoAtual: 0,
    estoqueMinimo: 10,
    estoqueSeguranca: 5,
    localizacao: { corredor: 'A', rua: '01', prateleira: '01', nivel: 'N-1', codigoCompleto: 'ALM-A-01-01' },
    qrCodeValor: ''
  });

  // Form states for Line
  const [lineForm, setLineForm] = useState<Partial<ProductionLine>>({
    codigo: '',
    nome: '',
    setor: 'Montagem',
    ativa: true,
    postos: []
  });

  // Form states for User
  const [userForm, setUserForm] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'OPERADOR_PRODUCAO',
    roleLabel: 'Operador de Produção',
    badgeNumber: '',
    assignedArea: ''
  });

  // Handle open modal
  const handleOpenNew = () => {
    setModalMode('NEW');
    if (activeTab === 'MATERIAIS') {
      const nextId = `MAT-${Math.floor(1000 + Math.random() * 9000)}`;
      setMatForm({
        codigo: nextId,
        descricao: '',
        categoria: 'Elementos Mecânicos',
        unidadeMedida: 'UN',
        saldoAtual: 50,
        estoqueMinimo: 15,
        estoqueSeguranca: 5,
        localizacao: { corredor: 'A', rua: '02', prateleira: '01', nivel: 'N-1', codigoCompleto: `ALM-A-02-01` },
        qrCodeValor: `${nextId}|LOT-AUTO`
      });
    } else if (activeTab === 'LINHAS') {
      const nextCod = `LIN-0${lines.length + 1}`;
      setLineForm({
        codigo: nextCod,
        nome: `Linha ${lines.length + 1} - Nova Produção`,
        setor: 'Montagem',
        ativa: true,
        postos: []
      });
    } else if (activeTab === 'USUARIOS') {
      setUserForm({
        name: '',
        email: '',
        role: 'OPERADOR_PRODUCAO',
        roleLabel: 'Operador de Produção',
        badgeNumber: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedArea: 'Linha de Produção'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'MATERIAIS') {
      if (!matForm.codigo || !matForm.descricao) return;
      const newMat: Material = {
        id: matForm.id || `mat-${Date.now()}`,
        codigo: matForm.codigo!,
        descricao: matForm.descricao!,
        categoria: matForm.categoria || 'Geral',
        unidadeMedida: matForm.unidadeMedida || 'UN',
        saldoAtual: Number(matForm.saldoAtual) || 0,
        estoqueMinimo: Number(matForm.estoqueMinimo) || 10,
        estoqueSeguranca: Number(matForm.estoqueSeguranca) || 5,
        localizacao: matForm.localizacao || { corredor: 'A', rua: '01', prateleira: '01', nivel: 'N-1', codigoCompleto: 'ALM-A-01-01' },
        qrCodeValor: matForm.qrCodeValor || `${matForm.codigo}|LOT-AUTO`
      };
      onSaveMaterial(newMat);
    } else if (activeTab === 'LINHAS') {
      if (!lineForm.codigo || !lineForm.nome) return;
      const newLine: ProductionLine = {
        id: lineForm.id || `lin-${Date.now()}`,
        codigo: lineForm.codigo!,
        nome: lineForm.nome!,
        setor: lineForm.setor || 'Montagem',
        ativa: lineForm.ativa ?? true,
        postos: lineForm.postos || []
      };
      onSaveLine(newLine);
    } else if (activeTab === 'USUARIOS') {
      if (!userForm.name || !userForm.badgeNumber) return;
      const roleLabels: Record<UserRole, string> = {
        ADMIN: 'Administrador de Sistemas',
        GESTOR: 'Gestor de Logística & PCM',
        ESTOQUISTA: 'Operador de Almoxarifado',
        ABASTECEDOR: 'Operador de Logística Interna',
        OPERADOR_PRODUCAO: 'Operador de Montagem'
      };
      const role = userForm.role || 'OPERADOR_PRODUCAO';
      const newUser: User = {
        id: userForm.id || `usr-${Date.now()}`,
        name: userForm.name!,
        email: userForm.email || `${userForm.name.toLowerCase().replace(/\s+/g, '.')}@industria.com`,
        role,
        roleLabel: roleLabels[role],
        badgeNumber: userForm.badgeNumber!,
        assignedArea: userForm.assignedArea || 'Chão de Fábrica'
      };
      onSaveUser(newUser);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-600" />
            Cadastros Mestres & Parâmetros do Sistema
          </h2>
          <p className="text-xs text-slate-500">
            Gerenciamento de Materiais, Linhas de Produção, Postos de Trabalho e Perfis de Usuário.
          </p>
        </div>
        <button
          type="button"
          id="cadastros-add-btn"
          onClick={handleOpenNew}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('MATERIAIS')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'MATERIAIS'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Materiais ({materials.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('LINHAS')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'LINHAS'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Linhas de Produção ({lines.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('POSTOS')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'POSTOS'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Postos de Trabalho ({lines.reduce((acc, l) => acc + l.postos.length, 0)})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('USUARIOS')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'USUARIOS'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários & Perfis ({users.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Pesquisar em ${activeTab.toLowerCase()}...`}
          className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
        />
      </div>

      {/* Tables based on activeTab */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab 1: Materiais */}
        {activeTab === 'MATERIAIS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Descrição Técnica</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Endereço Almox.</th>
                  <th className="p-3 text-right">Saldo Físico</th>
                  <th className="p-3 text-right">Mínimo</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials
                  .filter(m => m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || m.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{mat.codigo}</td>
                      <td className="p-3 font-medium text-slate-900">{mat.descricao}</td>
                      <td className="p-3 text-slate-600">{mat.categoria}</td>
                      <td className="p-3 font-mono text-slate-700">{mat.localizacao.codigoCompleto}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{mat.saldoAtual} {mat.unidadeMedida}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{mat.estoqueMinimo}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setModalMode('EDIT');
                              setMatForm(mat);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMaterial(mat.id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Linhas */}
        {activeTab === 'LINHAS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Nome da Linha</th>
                  <th className="p-3">Setor Fabril</th>
                  <th className="p-3">Total de Postos</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines
                  .filter(l => l.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || l.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{line.codigo}</td>
                      <td className="p-3 font-medium text-slate-900">{line.nome}</td>
                      <td className="p-3 text-slate-600">{line.setor}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{line.postos.length} postos</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Operacional
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setModalMode('EDIT');
                              setLineForm(line);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteLine(line.id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Postos de Trabalho */}
        {activeTab === 'POSTOS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Código Posto</th>
                  <th className="p-3">Nome / Operação</th>
                  <th className="p-3">Linha Vinculada</th>
                  <th className="p-3">QR Code Físico</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.flatMap(l => l.postos)
                  .filter(p => p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((posto) => (
                    <tr key={posto.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{posto.codigo}</td>
                      <td className="p-3 font-medium text-slate-900">{posto.nome}</td>
                      <td className="p-3 text-slate-600">{posto.linhaNome}</td>
                      <td className="p-3 font-mono text-purple-700 font-semibold">{posto.qrCodePosto}</td>
                      <td className="p-3 text-center">
                        <span className="text-[11px] text-slate-400">Vinculado à Linha</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Usuários */}
        {activeTab === 'USUARIOS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Matrícula</th>
                  <th className="p-3">Nome Completo</th>
                  <th className="p-3">Perfil de Acesso</th>
                  <th className="p-3">Área de Atuação</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-700">{user.badgeNumber}</td>
                      <td className="p-3 font-medium text-slate-900">{user.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {user.roleLabel}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{user.assignedArea}</td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{user.email}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setModalMode('EDIT');
                              setUserForm(user);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for New / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {modalMode === 'NEW' ? 'Cadastrar Novo' : 'Editar'} {activeTab.slice(0, -1)}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-3 text-xs">
              {activeTab === 'MATERIAIS' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código do Material</label>
                    <input
                      type="text"
                      required
                      value={matForm.codigo || ''}
                      onChange={(e) => setMatForm({ ...matForm, codigo: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Descrição</label>
                    <input
                      type="text"
                      required
                      value={matForm.descricao || ''}
                      onChange={(e) => setMatForm({ ...matForm, descricao: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Saldo Atual</label>
                      <input
                        type="number"
                        value={matForm.saldoAtual ?? 0}
                        onChange={(e) => setMatForm({ ...matForm, saldoAtual: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Estoque Mínimo</label>
                      <input
                        type="number"
                        value={matForm.estoqueMinimo ?? 10}
                        onChange={(e) => setMatForm({ ...matForm, estoqueMinimo: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'LINHAS' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código da Linha</label>
                    <input
                      type="text"
                      required
                      value={lineForm.codigo || ''}
                      onChange={(e) => setLineForm({ ...lineForm, codigo: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nome da Linha</label>
                    <input
                      type="text"
                      required
                      value={lineForm.nome || ''}
                      onChange={(e) => setLineForm({ ...lineForm, nome: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Setor</label>
                    <input
                      type="text"
                      value={lineForm.setor || ''}
                      onChange={(e) => setLineForm({ ...lineForm, setor: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTab === 'USUARIOS' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={userForm.name || ''}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Matrícula / Crachá</label>
                    <input
                      type="text"
                      required
                      value={userForm.badgeNumber || ''}
                      onChange={(e) => setUserForm({ ...userForm, badgeNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Perfil de Acesso</label>
                    <select
                      value={userForm.role || 'OPERADOR_PRODUCAO'}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    >
                      <option value="ADMIN">Administrador</option>
                      <option value="GESTOR">Gestor</option>
                      <option value="ESTOQUISTA">Estoquista</option>
                      <option value="ABASTECEDOR">Abastecedor</option>
                      <option value="OPERADOR_PRODUCAO">Operador de Produção</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
