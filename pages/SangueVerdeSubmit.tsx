
import React, { useState } from 'react';
import { 
  Droplets, UserPlus, CheckCircle, Upload, Video, Camera, Info, Search, 
  Send, Loader2, Calendar, Building2, UserCircle, Briefcase, Trash2
} from 'lucide-react';
import { UserAccount, CycleConfig, SangueVerdeNomination } from '../types';
import { SANGUE_VERDE_VALUES } from '../constants';
import { db, COLECOES, collection, addDoc, doc, getDoc } from '../firebase';
import { getLocalISODate } from '../utils/dateUtils';

interface SangueVerdeSubmitProps {
  user: UserAccount;
  cycleConfig: CycleConfig;
}

export const SangueVerdeSubmit: React.FC<SangueVerdeSubmitProps> = ({ user, cycleConfig }) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nomineeName: '',
    registration: '',
    costCenter: '',
    admissionDate: '',
    justification: '',
    selectedValues: [] as string[]
  });

  const fetchNomineeData = async () => {
    const reg = formData.registration.trim();
    if (!reg) return;

    setSearching(true);
    try {
      const userRef = doc(db, COLECOES.COLABORADORES, reg);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserAccount;
        setFormData(prev => ({
          ...prev,
          nomineeName: userData.name || '',
          costCenter: userData.costCenter || '',
          admissionDate: userData.admissionDate || ''
        }));
        if (userData.profilePhoto) {
          setProfilePreview(userData.profilePhoto);
        }
      } else {
        alert("Colaborador não encontrado. Por favor, verifique a matrícula ou preencha manualmente.");
      }
    } catch (err) {
      console.error("Erro ao buscar colaborador:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleToggleValue = (valId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedValues: prev.selectedValues.includes(valId) 
        ? prev.selectedValues.filter(v => v !== valId)
        : [...prev.selectedValues, valId]
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
    if (formData.selectedValues.length === 0) return alert("Selecione ao menos um valor.");
    if (!profilePreview) return alert("Anexe a foto do perfil.");
    
    setLoading(true);
    try {
      const payload: Partial<SangueVerdeNomination> = {
        ...formData,
        profilePhoto: profilePreview,
        validationVideos: [], 
        nominatorName: user.name,
        year: cycleConfig.year,
        quarter: cycleConfig.quarter,
        dateSubmitted: getLocalISODate()
      };
      await addDoc(collection(db, "sangue_verde_indicacoes"), payload);
      setSuccess(true);
    } catch (err) {
      alert("Erro ao enviar indicação.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="max-w-4xl mx-auto py-20 text-center space-y-8 animate-in zoom-in-95">
      <div className="w-32 h-32 bg-emerald-100 rounded-[40px] flex items-center justify-center mx-auto text-emerald-600 shadow-xl border-4 border-white">
        <Droplets className="w-16 h-16" />
      </div>
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Indicação Realizada!</h2>
        <p className="text-slate-500 font-medium">Sua indicação Sangue Verde foi salva e será processada pela comunicação.</p>
      </div>
      <button onClick={() => setSuccess(false)} className="px-10 py-5 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest shadow-xl">Nova Indicação</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-emerald-700 p-12 text-white relative">
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">Indicação Sangue Verde {cycleConfig.year}</h2>
            <p className="text-emerald-100 font-medium italic opacity-80">Reconhecendo atitudes extraordinárias que fortalecem nossa cultura.</p>
          </div>
          <Droplets className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 text-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-16">
          <div className="space-y-10">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">01</div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Identificação do Colaborador</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center">
              <label className="relative cursor-pointer group shrink-0">
                <div className="w-36 h-36 rounded-[40px] border-4 border-slate-50 bg-slate-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-200 shadow-lg">
                  {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <Camera className="w-12 h-12 text-slate-300" />}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 p-3 rounded-2xl text-white shadow-xl">
                  <Upload className="w-4 h-4" />
                </div>
              </label>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-1 col-span-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrícula (ID) - Digite e clique em buscar *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                       <input 
                         required 
                         type="text" 
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                         value={formData.registration} 
                         onChange={e => setFormData({...formData, registration: e.target.value})} 
                         placeholder="Ex: 10618"
                       />
                    </div>
                    <button 
                      type="button" 
                      onClick={fetchNomineeData}
                      disabled={searching}
                      className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                    >
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} BUSCAR
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Indicado *</label>
                  <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.nomineeName} onChange={e => setFormData({...formData, nomineeName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Centro de Custo *</label>
                  <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.costCenter} onChange={e => setFormData({...formData, costCenter: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Admissão *</label>
                  <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">02</div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Valores Demonstrados</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {SANGUE_VERDE_VALUES.map(v => (
                <button 
                  key={v.id} 
                  type="button"
                  onClick={() => handleToggleValue(v.id)}
                  className={`p-6 rounded-3xl border-2 text-left transition-all flex items-start gap-5 ${
                    formData.selectedValues.includes(v.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-200'
                  }`}
                >
                  <div className={`mt-1 p-1 rounded-full border-2 ${formData.selectedValues.includes(v.id) ? 'border-white' : 'border-slate-300'}`}>
                    <CheckCircle className={`w-3 h-3 ${formData.selectedValues.includes(v.id) ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{v.label}</p>
                    <p className={`text-[10px] font-medium mt-1 ${formData.selectedValues.includes(v.id) ? 'text-emerald-100' : 'text-slate-400'}`}>{v.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">03</div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Justificativa da Indicação</h3>
            </div>
            <textarea 
              required
              rows={8}
              className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[40px] outline-none font-medium text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/5 transition-all"
              placeholder="Descreva a ação extraordinária realizada... Explique detalhadamente o impacto para a organização."
              value={formData.justification}
              onChange={e => setFormData({...formData, justification: e.target.value})}
            />
          </div>

          <div className="bg-slate-900 p-10 rounded-[48px] space-y-6 text-white relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <Video className="w-10 h-10 text-emerald-500" />
              <div>
                <h4 className="text-lg font-black uppercase">Vídeos de Validação</h4>
                <p className="text-xs text-slate-400">Grave (2) dois vídeos curtos na vertical para validar a indicação.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center text-center gap-4">
                <UserCircle className="w-8 h-8 text-slate-500" />
                <p className="text-[10px] font-black uppercase opacity-60">Líder Direto</p>
                <button type="button" className="px-6 py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20">Anexar Vídeo</button>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center text-center gap-4">
                <Briefcase className="w-8 h-8 text-slate-500" />
                <p className="text-[10px] font-black uppercase opacity-60">Gerente</p>
                <button type="button" className="px-6 py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20">Anexar Vídeo</button>
              </div>
            </div>
            <Droplets className="absolute -right-20 -bottom-20 w-64 h-64 text-white/5" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-emerald-600 text-white font-black text-xl rounded-[32px] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            SUBMETER INDICAÇÃO SANGUE VERDE
          </button>
        </form>
      </div>
    </div>
  );
};
