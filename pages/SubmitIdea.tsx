
import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle, 
  User, 
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Zap,
  Loader2,
  AlertCircle,
  Building,
  ChevronDown,
  Sparkles,
  MapPin,
  Settings,
  Coins,
  ArrowUpRight,
  UserPlus,
  Video,
  Link as LinkIcon,
  Calendar,
  Clock,
  FileText,
  Target,
  Phone,
  Tag,
  Camera
} from 'lucide-react';
import { Idea, IdeaType, CycleConfig, UserAccount, UserRole } from '../types';
import { db, COLECOES, collection, addDoc, getDocs, query, where } from '../firebase';
import { formatLocalDate, getLocalISODate } from '../utils/dateUtils';

interface SubmitIdeaProps {
  user: UserAccount;
  cycleConfig: CycleConfig;
}

const CRITERIOS_LISTA = [
  { id: 'implantacao', label: 'Implantação', icon: CheckCircle, color: 'text-emerald-500' },
  { id: 'seguranca', label: 'Segurança/Ambiental', icon: ShieldCheck, color: 'text-emerald-500' },
  { id: 'produtividade', label: 'Produtividade', icon: Zap, color: 'text-amber-500' },
  { id: 'custo', label: 'Custo', icon: DollarSign, color: 'text-rose-500' },
  { id: 'retorno', label: 'Retorno Financeiro', icon: TrendingUp, color: 'text-emerald-500' },
  { id: 'inovacao', label: 'Inovação', icon: Lightbulb, color: 'text-emerald-500' },
];

export const SubmitIdea: React.FC<SubmitIdeaProps> = ({ user, cycleConfig }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(user.profilePhoto || null);
  
  const [loadingGreenBelts, setLoadingGreenBelts] = useState(true);
  const [allGreenBelts, setAllGreenBelts] = useState<UserAccount[]>([]);

  const today = getLocalISODate();
  const isSubmissionOpen = today >= cycleConfig.submissionStart && today <= cycleConfig.submissionEnd;
  const canOverride = user.role === UserRole.ADMIN;
  const isBlocked = !isSubmissionOpen && !canOverride;

  const [formData, setFormData] = useState({
    registration: user.registration,
    fullname: user.name,
    nickname: '',
    phone: user.phone || '',
    email: user.email || '',
    greenBelt: '',
    sector: user.sector || '',
    ideaDate: today,
    category: '',
    location: '',
    problem: '',
    idea: '',
    implementationDetails: '',
    investment: '',
    financialReturn: '',
    manager: '',
    videoUrl: '',
    selectedCriteria: [] as string[],
  });

  useEffect(() => {
    if (isBlocked) return;
    const fetchGreenBelts = async () => {
      setLoadingGreenBelts(true);
      try {
        const q = query(
          collection(db, COLECOES.COLABORADORES), 
          where("role", "==", UserRole.GREEN_BELT)
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserAccount));
        setAllGreenBelts(list);
        
        let suggested = list.find(gb => gb.managedCostCenters?.includes(user.costCenter));
        if (!suggested) suggested = list.find(gb => gb.managedSectors?.includes(user.sector) || gb.sector === user.sector);
        if (suggested) {
          setFormData(prev => ({ ...prev, greenBelt: suggested.name }));
        }
      } catch (err) {
        console.error("Erro ao carregar Green Belts:", err);
      } finally {
        setLoadingGreenBelts(false);
      }
    };
    fetchGreenBelts();
  }, [user.sector, user.costCenter, isBlocked]);

  const handleCriteriaToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCriteria: prev.selectedCriteria.includes(id) 
        ? prev.selectedCriteria.filter(vId => vId !== id)
        : [...prev.selectedCriteria, id]
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;
    if (!formData.greenBelt) {
      alert("Por favor, selecione um Green Belt para apoiar sua ideia.");
      return;
    }

    setSubmitting(true);
    try {
      const novaIdeia: any = {
        ...formData,
        title: formData.idea.substring(0, 50) + (formData.idea.length > 50 ? '...' : ''),
        author: formData.fullname,
        area: formData.sector,
        dateSubmitted: getLocalISODate(),
        cycle: cycleConfig.quarter,
        year: cycleConfig.year,
        finalType: IdeaType.PENDENTE,
        evaluations: [],
        finalScore: 0,
        votes: 0
      };
      if (profilePreview) novaIdeia.profilePhoto = profilePreview;
      await addDoc(collection(db, COLECOES.IDEIAS), novaIdeia);
      setSubmitted(true);
    } catch (error) {
      alert("Erro ao salvar no banco de dados.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isBlocked) {
    return (
      <div className="max-w-4xl mx-auto py-12 sm:py-20 flex flex-col items-center justify-center text-center px-4 space-y-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-rose-50 rounded-[24px] sm:rounded-[32px] flex items-center justify-center text-rose-500 shadow-xl border border-rose-100">
          <Clock className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Período iGreen Encerrado</h2>
          <p className="text-slate-500 max-w-md mx-auto text-base sm:text-lg font-medium leading-relaxed">
            As submissões para o Ciclo iGreen foram encerradas em <b>{formatLocalDate(cycleConfig.submissionEnd)}</b>.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4 space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle className="text-emerald-500 w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tighter">IDEIA iGreen RECEBIDA!</h2>
          <p className="text-slate-500 max-w-md mx-auto text-base sm:text-lg font-medium">Sua inovação foi registrada com sucesso.</p>
        </div>
        <button onClick={() => setSubmitted(false)} className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs sm:text-sm">ENVIAR OUTRA IDEIA</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-6 sm:p-12 text-white relative">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight relative z-10">Nova Ideia Inovadora 2026</h2>
          <p className="text-emerald-400 font-black text-[9px] sm:text-xs uppercase tracking-[0.2em] relative z-10 mb-2 sm:mb-4">
            {cycleConfig.quarter}º TRIMESTRE • UNIDADE {user.sector}
          </p>
          <Lightbulb className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 text-emerald-500/10" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-12 sm:space-y-20">
          
          {/* SEÇÃO 01: QUEM É O INOVADOR */}
          <div className="space-y-8 sm:space-y-10">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">01</div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">Informações & Mentoria</h3>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 items-center lg:items-start">
              <div className="flex flex-col items-center gap-4 shrink-0">
                <label className="relative cursor-pointer group">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[32px] sm:rounded-[40px] border-4 border-slate-50 bg-slate-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-200 shadow-inner">
                    {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" alt="Preview" /> : <User className="w-10 h-10 sm:w-14 sm:h-14 text-slate-300" />}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 p-2.5 sm:p-3 rounded-2xl text-white shadow-xl hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </label>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto de Perfil</span>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Matrícula</label>
                  <input readOnly className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-400 text-sm cursor-not-allowed" value={formData.registration} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input readOnly className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-400 text-sm cursor-not-allowed" value={formData.fullname} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Apelido</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} placeholder="Ex: Zé, Beto..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 0 0000-0000" />
                  </div>
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Mentor iGreen (Green Belt) *</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full pl-12 pr-10 py-5 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none appearance-none font-black text-emerald-800 text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                      value={formData.greenBelt}
                      onChange={e => setFormData({...formData, greenBelt: e.target.value})}
                    >
                      <option value="" disabled>Selecione seu mentor...</option>
                      {allGreenBelts.map(gb => (
                        <option key={gb.uid} value={gb.name}>{gb.name} - {gb.sector}</option>
                      ))}
                    </select>
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-6 h-6" />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-700 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 02: DIAGNÓSTICO */}
          <div className="space-y-8 sm:space-y-10">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">02</div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">Onde & O Que</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria *</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Operacional, TI..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Local Exato *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Ex: Armazém 04..." />
                </div>
              </div>
              <div className="col-span-full space-y-1">
                <label className="text-[9px] sm:text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Problema a ser Resolvido *</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-4 sm:p-6 bg-rose-50/20 border border-rose-100 rounded-[24px] sm:rounded-[32px] outline-none font-medium text-slate-700 text-sm focus:ring-4 focus:ring-rose-500/5 transition-all"
                  placeholder="Descreva a situação atual..."
                  value={formData.problem}
                  onChange={e => setFormData({...formData, problem: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 03: A SOLUÇÃO */}
          <div className="space-y-8 sm:space-y-10">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">03</div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">Sua Ideia Inovadora</h3>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-emerald-700 uppercase tracking-widest ml-1">Qual sua Ideia Inovadora? *</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-6 sm:p-8 bg-emerald-50/30 border-2 border-emerald-100 rounded-[32px] sm:rounded-[40px] outline-none font-black text-base sm:text-lg text-emerald-900 placeholder:text-emerald-200 focus:border-emerald-500 transition-all shadow-inner"
                  placeholder="Nome e conceito da sua ideia..."
                  value={formData.idea}
                  onChange={e => setFormData({...formData, idea: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Como Fazer? *</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-6 sm:p-8 bg-slate-50 border border-slate-200 rounded-[24px] sm:rounded-[32px] outline-none font-medium text-slate-700 text-sm focus:ring-4 focus:ring-emerald-500/5 transition-all"
                  placeholder="Explique o passo a passo..."
                  value={formData.implementationDetails}
                  onChange={e => setFormData({...formData, implementationDetails: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 04: VIABILIDADE */}
          <div className="space-y-8 sm:space-y-10">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20">04</div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">Viabilidade & Foco</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recursos Necessários? *</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-[20px] sm:rounded-[24px] outline-none font-bold text-slate-700 text-sm"
                  placeholder="Equipamentos, softwares..."
                  value={formData.investment}
                  onChange={e => setFormData({...formData, investment: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Impacto Financeiro / Retorno *</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full p-4 sm:p-6 bg-emerald-50/20 border border-emerald-100 rounded-[20px] sm:rounded-[24px] outline-none font-black text-emerald-900 text-sm"
                  placeholder="Economia, lucro..."
                  value={formData.financialReturn}
                  onChange={e => setFormData({...formData, financialReturn: e.target.value})}
                />
              </div>
              <div className="col-span-full space-y-1">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Superior Imediato *</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    required
                    className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm outline-none"
                    placeholder="Nome do gestor que apoia esta ideia"
                    value={formData.manager}
                    onChange={e => setFormData({...formData, manager: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Onde sua ideia Inova mais?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {CRITERIOS_LISTA.map(crit => {
                  const isSelected = formData.selectedCriteria.includes(crit.id);
                  const Icon = crit.icon;
                  return (
                    <button 
                      key={crit.id} 
                      type="button" 
                      className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all group ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-200'}`} 
                      onClick={(e) => { e.preventDefault(); handleCriteriaToggle(crit.id); }}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : crit.color}`} />
                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-center leading-tight">{crit.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-10 border-t border-slate-100 flex flex-col items-center gap-6">
            <div className="w-full space-y-1">
               <label className="text-[9px] sm:text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Video className="w-4 h-4" /> Link do Pitch de Vídeo (Opcional)
               </label>
               <input 
                 type="url" 
                 className="w-full p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-600 text-sm" 
                 placeholder="Cole o link do seu vídeo..."
                 value={formData.videoUrl}
                 onChange={e => setFormData({...formData, videoUrl: e.target.value})}
               />
            </div>

            <button 
              type="submit" 
              disabled={submitting || loadingGreenBelts} 
              className="w-full py-5 sm:py-7 bg-emerald-600 text-white font-black text-base sm:text-xl rounded-[24px] sm:rounded-[32px] shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-4 uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" /> : <Send className="w-6 h-6 sm:w-7 sm:h-7" />}
              {submitting ? 'ENVIANDO...' : 'SUBMETER IDEIA INOVADORA'}
            </button>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 text-center">
              <ShieldCheck className="w-4 h-4 shrink-0" /> Comitê de Inovação iGreen 2026
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
