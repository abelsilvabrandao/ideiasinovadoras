
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Search, Edit2, Trash2, CheckCircle, X, Calendar, RefreshCw, ShieldCheck, 
  Users, Loader2, Send, Save, Settings, Database, Filter, Droplets, Lightbulb, ChevronRight, Clock,
  History, Download, KeyRound, Building2, UserCircle, Briefcase, Share2, Link as LinkIcon,
  Mail, Phone, Fingerprint, MapPin, Landmark, Briefcase as PositionIcon, ListFilter
} from 'lucide-react';
import { UserRole, UserAccount, CycleConfig, ProgramType } from '../types';
import { db, COLECOES, collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from '../firebase';

export const AdminManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'calendar_ideias' | 'calendar_sangue'>('users');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [configs, setConfigs] = useState<Record<string, CycleConfig>>({});
  const [activeIdeias, setActiveIdeias] = useState<CycleConfig | null>(null);
  const [activeSangue, setActiveSangue] = useState<CycleConfig | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [editBuffer, setEditBuffer] = useState<CycleConfig | null>(null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '', email: '', role: UserRole.COLABORADOR, registration: '', 
    sector: '', position: '', costCenter: '', birthDate: '', admissionDate: '', phone: '',
    managedSectors: '', managedCostCenters: '', isManager: false
  });

  useEffect(() => {
    const qUsers = query(collection(db, COLECOES.COLABORADORES), orderBy("name", "asc"));
    const unsubscribeUsers = onSnapshot(qUsers, (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserAccount)));
    });

    const unsubscribeConfigs = onSnapshot(collection(db, COLECOES.CICLOS), (snap) => {
      const data: Record<string, CycleConfig> = {};
      snap.docs.forEach(d => {
        if (d.id === 'atual_ideias') setActiveIdeias(d.data() as CycleConfig);
        else if (d.id === 'atual_sangue') setActiveSangue(d.data() as CycleConfig);
        else data[d.id] = { id: d.id, ...d.data() } as CycleConfig;
      });
      setConfigs(data);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeConfigs();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'users') return;
    const program = activeTab === 'calendar_ideias' ? ProgramType.IDEIAS : ProgramType.SANGUE_VERDE;
    const configId = `${program}_${selectedYear}_Q${selectedQuarter}`;
    const existing = configs[configId];
    
    setEditBuffer(existing || {
      program,
      year: selectedYear,
      quarter: selectedQuarter,
      submissionStart: '',
      submissionEnd: '',
      evaluationStart: '',
      evaluationEnd: '',
      resultsDate: '',
      isPublished: false,
      videoStorageUrl: ''
    });
  }, [selectedQuarter, selectedYear, activeTab, configs]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const reg = userFormData.registration.trim();
      const userRef = doc(db, COLECOES.COLABORADORES, reg);
      
      const payload: any = {
        ...userFormData,
        uid: reg,
        managedSectors: userFormData.managedSectors.split(',').map(s => s.trim()).filter(Boolean),
        managedCostCenters: userFormData.managedCostCenters.split(',').map(s => s.trim()).filter(Boolean)
      };

      await setDoc(userRef, payload, { merge: true });
      setShowUserModal(false);
      resetUserForm();
      alert("Usuário iGreen salvo com sucesso!");
    } catch (err) {
      alert("Erro ao salvar usuário.");
    } finally {
      setSaving(false);
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      name: '', email: '', role: UserRole.COLABORADOR, registration: '', 
      sector: '', position: '', costCenter: '', birthDate: '', admissionDate: '', phone: '',
      managedSectors: '', managedCostCenters: '', isManager: false
    });
    setEditingUserId(null);
  };

  const handleEditUser = (user: UserAccount) => {
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || UserRole.COLABORADOR,
      registration: user.registration || '',
      sector: user.sector || '',
      position: user.position || '',
      costCenter: user.costCenter || '',
      birthDate: user.birthDate || '',
      admissionDate: user.admissionDate || '',
      phone: user.phone || '',
      isManager: !!user.isManager,
      managedSectors: Array.isArray(user.managedSectors) ? user.managedSectors.join(', ') : '',
      managedCostCenters: Array.isArray(user.managedCostCenters) ? user.managedCostCenters.join(', ') : ''
    });
    setEditingUserId(user.registration);
    setShowUserModal(true);
  };

  const handleSaveConfig = async (activate: boolean) => {
    if (!editBuffer) return;
    setSaving(true);
    try {
      const configId = `${editBuffer.program}_${editBuffer.year}_Q${editBuffer.quarter}`;
      await setDoc(doc(db, COLECOES.CICLOS, configId), editBuffer);
      
      if (activate) {
        const activeDocId = editBuffer.program === ProgramType.IDEIAS ? 'atual_ideias' : 'atual_sangue';
        await setDoc(doc(db, COLECOES.CICLOS, activeDocId), editBuffer);
        alert(`Ciclo iGreen ativado com sucesso!`);
      } else {
        alert("Configurações salvas no histórico iGreen.");
      }
    } catch (err) {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.registration.includes(searchQuery) ||
                          u.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-rose-100 text-rose-600 border-rose-200';
      case UserRole.GREEN_BELT: return 'bg-blue-100 text-blue-600 border-blue-200';
      case UserRole.COMITE: return 'bg-amber-100 text-amber-600 border-amber-200';
      case UserRole.AGENTE_IMPLANTACAO: return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    }
  };

  const renderCalendarTab = (program: ProgramType) => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-right-4">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <History className="w-4 h-4" /> Selecionar Período iGreen
          </div>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(q => (
              <button key={q} onClick={() => setSelectedQuarter(q)} className={`p-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${selectedQuarter === q ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                {q}º TRI
              </button>
            ))}
          </div>
        </div>
        <div className="bg-emerald-900 p-6 rounded-[32px] text-white shadow-xl shadow-emerald-900/20">
          <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Ciclo Ativo iGreen:</p>
          <p className="text-sm font-black uppercase tracking-tight">
            {program === ProgramType.IDEIAS 
              ? (activeIdeias ? `${activeIdeias.quarter}º TRI/${activeIdeias.year}` : 'Nenhum') 
              : (activeSangue ? `${activeSangue.quarter}º TRI/${activeSangue.year}` : 'Nenhum')}
          </p>
        </div>
      </div>

      <div className="lg:col-span-3">
        {editBuffer && (
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Configurar {selectedQuarter}º Trimestre {selectedYear}</h3>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Portal {program.replace('_', ' ')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSaveConfig(false)} disabled={saving} className="px-5 py-3 border-2 border-slate-900 text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Salvar Histórico</button>
                <button onClick={() => handleSaveConfig(true)} disabled={saving} className="px-5 py-3 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center gap-2 hover:bg-emerald-500 transition-all">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Salvar e Ativar iGreen
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-xs font-black uppercase text-emerald-600 tracking-widest">Submissões</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Abertura</label>
                    <input type="date" value={editBuffer.submissionStart} onChange={e => setEditBuffer({...editBuffer, submissionStart: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fechamento</label>
                    <input type="date" value={editBuffer.submissionEnd} onChange={e => setEditBuffer({...editBuffer, submissionEnd: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-xs font-black uppercase text-emerald-600 tracking-widest">Avaliação / Resultados</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Início</label>
                    <input type="date" value={editBuffer.evaluationStart} onChange={e => setEditBuffer({...editBuffer, evaluationStart: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resultados</label>
                    <input type="date" value={editBuffer.resultsDate} onChange={e => setEditBuffer({...editBuffer, resultsDate: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10" />
                  </div>
                </div>
              </div>

              <div className="col-span-full space-y-2 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <label className="text-xs font-black uppercase text-emerald-800 tracking-widest">Link da Pasta SharePoint (Armazenamento de Vídeos)</label>
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-4 h-4" />
                  <input 
                    type="url" 
                    placeholder="https://intermaritima.sharepoint.com/..." 
                    className="w-full p-4 pl-12 bg-white border border-emerald-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                    value={editBuffer.videoStorageUrl || ''}
                    onChange={e => setEditBuffer({...editBuffer, videoStorageUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Gestão Master iGreen</h2>
          <p className="text-slate-500 font-medium italic">Administração de ciclos, cronogramas e permissões de acesso.</p>
        </div>
        <div className="flex p-1 bg-slate-200/50 rounded-2xl">
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Colaboradores & Perfis</button>
          <button onClick={() => setActiveTab('calendar_ideias')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar_ideias' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}>Ciclos Ideias</button>
          <button onClick={() => setActiveTab('calendar_sangue')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar_sangue' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}>Ciclos Sangue</button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total iGreen</p>
                <p className="text-2xl font-black text-slate-900">{users.length}</p>
             </div>
             <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Green Belts</p>
                <p className="text-2xl font-black text-blue-600">{users.filter(u => u.role === UserRole.GREEN_BELT).length}</p>
             </div>
             <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Colaboradores</p>
                <p className="text-2xl font-black text-emerald-600">{users.filter(u => u.role === UserRole.COLABORADOR).length}</p>
             </div>
             <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
                <p className="text-[9px] font-black text-amber-400 uppercase mb-1">Comitê</p>
                <p className="text-2xl font-black text-amber-600">{users.filter(u => u.role === UserRole.COMITE).length}</p>
             </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="text" placeholder="Nome, matrícula ou setor..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="relative w-full md:w-48">
                  <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-[10px] font-black uppercase appearance-none outline-none focus:ring-2 focus:ring-emerald-500/10"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                  >
                    <option value="ALL">Todos os Perfis</option>
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => { resetUserForm(); setShowUserModal(true); }} className="px-6 py-3 bg-slate-900 text-white font-black rounded-2xl flex items-center gap-2 uppercase tracking-widest text-[10px] shadow-lg shadow-slate-900/20 active:scale-95 transition-all"><UserPlus className="w-4 h-4" /> Cadastrar iGreen</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-6">Inovador / Colaborador</th>
                    <th className="px-8 py-6">Setor / CC</th>
                    <th className="px-8 py-6">Perfil de Acesso</th>
                    <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <tr key={user.registration} className="hover:bg-slate-50/80 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                            {user.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover" /> : <UserCircle className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                               <p className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{user.name}</p>
                               {user.isManager && <span className="p-1 bg-emerald-100 text-emerald-600 rounded-md" title="Gestor Habilitado"><Briefcase className="w-3 h-3" /></span>}
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 uppercase">Matrícula: {user.registration}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-700">{user.sector}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase">CC: {user.costCenter || '-'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border transition-all ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditUser(user)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg" title="Editar Dados"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={async () => { if(confirm("Excluir este acesso iGreen permanentemente?")) await deleteDoc(doc(db, COLECOES.COLABORADORES, user.registration)); }} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg" title="Remover Acesso"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : renderCalendarTab(activeTab === 'calendar_ideias' ? ProgramType.IDEIAS : ProgramType.SANGUE_VERDE)}

      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Settings className="text-emerald-500 w-6 h-6" />
                {editingUserId ? 'Editar Dados iGreen' : 'Novo Inovador iGreen'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[80vh] overflow-y-auto">
              <div className="col-span-full border-b border-slate-100 pb-2">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">01. Identificação Pessoal</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Fingerprint className="w-3 h-3" /> Matrícula (ID) *
                    </label>
                    <input required disabled={!!editingUserId} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 disabled:opacity-50" value={userFormData.registration} onChange={e => setUserFormData({...userFormData, registration: e.target.value})} placeholder="Ex: 10618" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <UserCircle className="w-3 h-3" /> Nome Completo *
                    </label>
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} placeholder="Nome completo do colaborador" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-3 h-3" /> E-mail Institucional
                    </label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} placeholder="email@empresa.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="w-3 h-3" /> WhatsApp
                    </label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.phone} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} placeholder="(71) 00000-0000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Data de Nascimento
                    </label>
                    <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.birthDate} onChange={e => setUserFormData({...userFormData, birthDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="col-span-full border-b border-slate-100 pb-2">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">02. Estrutura Organizacional</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Setor *
                    </label>
                    <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.sector} onChange={e => setUserFormData({...userFormData, sector: e.target.value})} placeholder="Ex: Operacional, Logística..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <PositionIcon className="w-3 h-3" /> Cargo / Função
                    </label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.position} onChange={e => setUserFormData({...userFormData, position: e.target.value})} placeholder="Ex: Operador de Guindaste" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Landmark className="w-3 h-3" /> Centro de Custo
                    </label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.costCenter} onChange={e => setUserFormData({...userFormData, costCenter: e.target.value})} placeholder="Ex: 1010, 2020" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Data de Admissão
                    </label>
                    <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.admissionDate} onChange={e => setUserFormData({...userFormData, admissionDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">03. Perfil iGreen & Mentoria</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> Perfil iGreen *
                    </label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})}>
                      {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Briefcase className={`w-5 h-5 ${userFormData.isManager ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Habilitar Gestão?</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setUserFormData({...userFormData, isManager: !userFormData.isManager})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${userFormData.isManager ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userFormData.isManager ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setores Mentoreados (Separados por vírgula)</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.managedSectors} onChange={e => setUserFormData({...userFormData, managedSectors: e.target.value})} placeholder="Ex: Operação, Logística, TI..." />
                  </div>
                  <div className="md:col-span-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CCs Mentoreados</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={userFormData.managedCostCenters} onChange={e => setUserFormData({...userFormData, managedCostCenters: e.target.value})} placeholder="Ex: 1010, 2020..." />
                  </div>
                </div>
              </div>

              <div className="col-span-full pt-6 flex gap-4">
                 <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-5 border-2 border-slate-200 text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">Cancelar</button>
                 <button type="submit" disabled={saving} className="flex-[2] py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all active:scale-95">
                  {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />} 
                  {editingUserId ? 'Salvar Mudanças Master' : 'Confirmar Cadastro Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
