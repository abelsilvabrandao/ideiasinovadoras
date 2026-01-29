
import React, { useState, useEffect } from 'react';
import { 
  User, Camera, Mail, ShieldAlert, CheckCircle, Loader2, Briefcase, Building2, Fingerprint, Calendar, Layers, Phone, Hash, MapPin, Landmark
} from 'lucide-react';
import { UserAccount } from '../types';
import { db, COLECOES, doc, updateDoc } from '../firebase';
import { formatLocalDate } from '../utils/dateUtils';

interface ProfileProps {
  user: UserAccount;
  onUpdateUser: (updatedUser: UserAccount) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sincroniza estados se o prop user mudar (ex: login)
  useEffect(() => {
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setProfilePhoto(user.profilePhoto || '');
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userRef = doc(db, COLECOES.COLABORADORES, user.registration);
      const updates = { email, phone, profilePhoto };
      await updateDoc(userRef, updates);
      
      const updatedUser = { ...user, ...updates };
      onUpdateUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Erro ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        {/* Cabeçalho do Perfil */}
        <div className="bg-slate-900 p-12 text-white relative">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500/50">
                {profilePhoto ? (
                  <img src={profilePhoto} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-xl cursor-pointer hover:bg-blue-500 shadow-lg transition-transform active:scale-90">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black uppercase tracking-tight">{user.name}</h2>
              <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mt-1">{user.position || 'Cargo não definido'}</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Hash className="w-3 h-3" /> MATRÍCULA: {user.registration}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3" /> {user.role}
                </span>
              </div>
            </div>
          </div>
          <Building2 className="absolute right-0 top-0 w-64 h-64 text-white/5 -mr-10 -mt-10" />
        </div>

        <form onSubmit={handleSave} className="p-12 space-y-12">
          {/* Seção Editável: Contatos */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Mail className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Meus Contatos (Editável)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
                  E-mail institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção Somente Leitura: Dados Institucionais */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dados Institucionais (Somente Leitura)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Setor
                </p>
                <p className="text-sm font-bold text-slate-700">{user.sector || 'Não informado'}</p>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Landmark className="w-3 h-3" /> Centro de Custo
                </p>
                <p className="text-sm font-bold text-slate-700">{user.costCenter || 'Não informado'}</p>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Data de Nascimento
                </p>
                <p className="text-sm font-bold text-slate-700">{user.birthDate ? formatLocalDate(user.birthDate) : 'Não informado'}</p>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Fingerprint className="w-3 h-3" /> Matrícula
                </p>
                <p className="text-sm font-bold text-slate-700">{user.registration}</p>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Perfil de Acesso
                </p>
                <p className="text-sm font-bold text-slate-700 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Posição
                </p>
                <p className="text-sm font-bold text-slate-700">{user.position || 'Não informado'}</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={saving} 
              className={`w-full py-6 rounded-[32px] font-black uppercase text-sm tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] ${
                success ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
              }`}
            >
              {saving ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : success ? (
                <CheckCircle className="w-5 h-5 animate-in zoom-in" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {success ? 'DADOS ATUALIZADOS' : 'SALVAR ALTERAÇÕES'}
            </button>
            {success && (
              <p className="text-center text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-4 animate-in fade-in slide-in-from-top-2">
                Suas informações de contato foram sincronizadas com sucesso!
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
