
import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle, 
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Zap,
  Loader2,
  Building,
  ChevronDown,
  Sparkles,
  MapPin,
  Settings,
  Coins,
  ArrowUpRight,
  Video,
  Link as LinkIcon,
  ArrowLeft
} from 'lucide-react';
import { Idea, IdeaType, CycleConfig, UserAccount, UserRole } from '../types';
import { db, COLECOES, collection, getDocs, query, where, doc, updateDoc } from '../firebase';

interface EditIdeaProps {
  user: UserAccount;
  cycleConfig: CycleConfig;
  idea: Idea;
  onBack: () => void;
  onSuccess: () => void;
}

const CRITERIOS_LISTA = [
  { id: 'implantacao', label: 'Implantação', icon: CheckCircle, color: 'text-emerald-500' },
  { id: 'seguranca', label: 'Segurança/Ambiental', icon: ShieldCheck, color: 'text-emerald-500' },
  { id: 'produtividade', label: 'Produtividade', icon: Zap, color: 'text-amber-500' },
  { id: 'custo', label: 'Custo', icon: DollarSign, color: 'text-rose-500' },
  { id: 'retorno', label: 'Retorno Financeiro', icon: TrendingUp, color: 'text-emerald-500' },
  { id: 'inovacao', label: 'Inovação', icon: Lightbulb, color: 'text-emerald-500' },
];

export const EditIdea: React.FC<EditIdeaProps> = ({ user, cycleConfig, idea, onBack, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [loadingGreenBelts, setLoadingGreenBelts] = useState(true);
  const [allGreenBelts, setAllGreenBelts] = useState<UserAccount[]>([]);
  
  const [formData, setFormData] = useState({
    greenBelt: idea.greenBelt,
    location: idea.location,
    problem: idea.problem,
    ideaText: idea.idea,
    implementationDetails: idea.implementationDetails,
    investment: idea.investment,
    financialReturn: idea.financialReturn,
    manager: idea.manager,
    videoUrl: idea.videoUrl || '',
    selectedCriteria: idea.selectedCriteria || [],
  });

  useEffect(() => {
    const fetchGreenBelts = async () => {
      try {
        const q = query(collection(db, COLECOES.COLABORADORES), where("role", "==", UserRole.GREEN_BELT));
        const snapshot = await getDocs(q);
        setAllGreenBelts(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserAccount)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGreenBelts(false);
      }
    };
    fetchGreenBelts();
  }, []);

  const handleCriteriaToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCriteria: prev.selectedCriteria.includes(id) 
        ? prev.selectedCriteria.filter(c => c !== id)
        : [...prev.selectedCriteria, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ideaRef = doc(db, COLECOES.IDEIAS, idea.id);
      await updateDoc(ideaRef, {
        ...formData,
        idea: formData.ideaText,
        title: formData.ideaText.substring(0, 50) + (formData.ideaText.length > 50 ? '...' : ''),
      });
      onSuccess();
    } catch (error) {
      alert("Erro ao atualizar proposta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 font-black uppercase text-xs tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Cancelar Edição
      </button>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-emerald-600 p-10 text-white relative">
          <h2 className="text-3xl font-black uppercase tracking-tight relative z-10">Editar Proposta iGreen</h2>
          <p className="text-emerald-50 font-medium relative z-10">Atualize os detalhes da sua ideia antes do fechamento do ciclo iGreen.</p>
          <Settings className="absolute right-10 top-1/2 -translate-y-1/2 w-24 h-24 text-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">O Problema *</label>
              <textarea required rows={4} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none" value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A Solução iGreen *</label>
              <textarea required rows={4} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none font-bold text-slate-800" value={formData.ideaText} onChange={e => setFormData({...formData, ideaText: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local de Aplicação *</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Green Belt de Apoio *</label>
              <select required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.greenBelt} onChange={e => setFormData({...formData, greenBelt: e.target.value})}>
                {allGreenBelts.map(gb => <option key={gb.uid} value={gb.name}>{gb.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={submitting} className="w-full py-6 bg-emerald-700 text-white font-black text-lg rounded-[32px] shadow-2xl flex items-center justify-center gap-4 uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-[0.98]">
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              {submitting ? 'SALVANDO ALTERAÇÕES...' : 'SALVAR MINHA PROPOSTA iGreen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
