
import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, Loader2, CheckCircle, KeyRound, FlaskConical } from 'lucide-react';
import { UserRole, UserAccount } from '../types';
import { db, COLECOES, doc, getDoc, updateDoc } from '../firebase';

interface LoginProps {
  onLogin: (user: UserAccount) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [registration, setRegistration] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [tempUser, setTempUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const DEFAULT_INITIAL_PASSWORD = 'inter@2026';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, COLECOES.COLABORADORES, registration.trim());
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("Matrícula não encontrada.");
        setLoading(false);
        return;
      }

      const userData = userSnap.data() as UserAccount;
      const storedPassword = userData.password;
      
      if (!storedPassword) {
        if (password === DEFAULT_INITIAL_PASSWORD) {
          setTempUser({ ...userData, uid: userSnap.id });
          setNeedsNewPassword(true);
        } else {
          setError("Senha inicial incorreta.");
        }
      } else {
        if (password === storedPassword) {
          onLogin({ ...userData, uid: userSnap.id });
        } else {
          setError("Senha incorreta.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mínimo de 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, COLECOES.COLABORADORES, tempUser!.registration);
      await updateDoc(userRef, { password: newPassword });
      onLogin({ ...tempUser!, password: newPassword });
    } catch (err) {
      setError("Erro ao salvar senha.");
    } finally {
      setLoading(false);
    }
  };

  if (needsNewPassword) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full space-y-8 animate-in zoom-in-95">
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 bg-emerald-500 rounded-2xl sm:rounded-3xl shadow-2xl animate-bounce">
              <KeyRound className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Crie sua Senha InterLab</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Olá {tempUser?.name.split(' ')[0]}, defina uma senha pessoal.</p>
          </div>

          <form onSubmit={handleCreatePassword} className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/10 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
              <input type="password" required className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
              <input type="password" required className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            {error && <p className="text-rose-400 text-xs font-bold text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-4 sm:py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><CheckCircle className="w-5 h-5" /> ATIVAR CONTA</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-600/10 sm:bg-emerald-600/20 rounded-full blur-[80px] sm:blur-[120px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-600/10 sm:bg-emerald-600/20 rounded-full blur-[80px] sm:blur-[120px] -ml-32 -mb-32"></div>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex p-3 sm:p-4 bg-emerald-600 rounded-[30px] sm:rounded-[40px] shadow-2xl shadow-emerald-500/40 animate-bounce">
            {!imgError ? (
              <img 
                src="/iconelab.png" 
                alt="InterLab Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <FlaskConical className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase">InterLab</h1>
            <p className="text-emerald-400 font-black text-[9px] sm:text-xs uppercase tracking-[0.2em]">Nosso Sangue, Nossas Ideias.</p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/10 shadow-2xl space-y-5 sm:space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matrícula</label>
            <div className="relative">
              <input type="text" required className="w-full bg-white/10 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-mono" value={registration} onChange={(e) => setRegistration(e.target.value)} />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative">
              <input type="password" required className="w-full bg-white/10 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          {error && <p className="text-rose-400 text-[10px] sm:text-xs font-bold text-center bg-rose-400/10 py-2 rounded-xl border border-rose-400/20">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-4 sm:py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm tracking-widest uppercase">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>ACESSAR PORTAL <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
          </button>
          
          <div className="pt-1 text-center">
             <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-widest">
               Senha padrão inter@2026 para 1º acesso
             </p>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 text-slate-500 opacity-40">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">InterLab Secure Link</span>
        </div>
      </div>
    </div>
  );
};
