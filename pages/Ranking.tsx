
import React, { useState, useEffect } from 'react';
import { Trophy, Search, Filter, Lock, Calendar, CheckCircle, ShieldAlert, Droplets, Lightbulb, Users } from 'lucide-react';
import { Idea, IdeaType, UserRole, SangueVerdeNomination } from '../types';
import { db, collection, onSnapshot, query, orderBy } from '../firebase';
import { CALENDARIO_OFICIAL_2026 } from '../constants';

interface RankingProps {
  ideas: Idea[];
  userRole?: UserRole;
  isPublished: boolean;
  onViewIdea: (id: string) => void;
}

export const Ranking: React.FC<RankingProps> = ({ ideas, userRole, isPublished, onViewIdea }) => {
  const [activeProgram, setActiveProgram] = useState<'IDEIAS' | 'SANGUE_VERDE'>('IDEIAS');
  const [sangueNominations, setSangueNominations] = useState<SangueVerdeNomination[]>([]);
  const currentCycle = CALENDARIO_OFICIAL_2026[0];
  const isManagement = userRole !== UserRole.COLABORADOR;
  const showRanking = isPublished || isManagement;

  useEffect(() => {
    const q = query(collection(db, "sangue_verde_indicacoes"), orderBy("votes", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setSangueNominations(snap.docs.map(d => ({ id: d.id, ...d.data() } as SangueVerdeNomination)));
    });
    return () => unsubscribe();
  }, []);

  const sortedIdeas = [...ideas]
    .filter(i => i.finalType === IdeaType.INOVADORA)
    .sort((a, b) => (b.votes || 0) - (a.votes || 0));

  const sortedSangue = [...sangueNominations]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0));

  if (!showRanking) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-900 p-12 text-center text-white space-y-6 relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Lock className="w-10 h-10 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tight">Resultados em Apuração</h2>
                <p className="text-slate-400 max-w-md mx-auto font-medium">
                  A votação encerrou e os resultados oficiais serão publicados em breve pela gestão iGreen.
                </p>
              </div>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Calendar className="text-emerald-500 w-8 h-8 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-bold text-emerald-900">Previsão</h4>
                <p className="text-sm text-emerald-700">Publicação prevista para <b>{new Date(currentCycle.resultsDate).toLocaleDateString()}</b>.</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <CheckCircle className="text-emerald-500 w-8 h-8 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-bold text-emerald-900">Transparência</h4>
                <p className="text-sm text-emerald-700">Todos os votos estão sendo auditados para garantir um resultado iGreen justo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentList = activeProgram === 'IDEIAS' ? sortedIdeas : sortedSangue;
  const top3 = currentList.slice(0, 3);
  
  return (
    <div className="space-y-10 pb-20">
       <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Mural iGreen</h2>
             <p className="text-slate-500 font-medium">Reconhecimento oficial dos destaques do trimestre.</p>
          </div>
          <div className="flex p-1 bg-slate-200/50 rounded-2xl">
            <button onClick={() => setActiveProgram('IDEIAS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeProgram === 'IDEIAS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ideias Inovadoras</button>
            <button onClick={() => setActiveProgram('SANGUE_VERDE')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeProgram === 'SANGUE_VERDE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sangue Verde</button>
          </div>
       </div>

       {isManagement && !isPublished && (
         <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-3 text-amber-800">
             <ShieldAlert className="w-5 h-5" />
             <span className="text-xs font-bold uppercase tracking-wider">Modo Gestor iGreen (Ranking não publicado)</span>
           </div>
         </div>
       )}

       {/* Pódio Dinâmico */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto py-8">
        {/* Silver - 2nd */}
        {top3[1] && (
          <div className="order-2 md:order-1 h-full flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`w-24 h-24 rounded-[32px] border-4 ${activeProgram === 'IDEIAS' ? 'border-emerald-200' : 'border-emerald-200'} overflow-hidden shadow-xl`}>
                <img src={(top3[1] as any).profilePhoto || `https://picsum.photos/seed/${top3[1].id}/200/200`} className="w-full h-full object-cover" alt="2nd" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-100 border-2 border-slate-300 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md">🥈</div>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-800 uppercase text-xs">{(top3[1] as any).author || (top3[1] as any).nomineeName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{top3[1].votes || 0} Votos</p>
            </div>
            <div className={`w-full ${activeProgram === 'IDEIAS' ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-100 border-emerald-200'} h-32 rounded-t-[32px] border-x border-t flex items-center justify-center`}>
              <span className="text-4xl font-black opacity-20">2º</span>
            </div>
          </div>
        )}

        {/* Gold - 1st */}
        {top3[0] && (
          <div className="order-1 md:order-2 flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`w-32 h-32 rounded-[40px] border-4 ${activeProgram === 'IDEIAS' ? 'border-emerald-500 shadow-emerald-500/20' : 'border-emerald-500 shadow-emerald-500/20'} overflow-hidden shadow-2xl scale-110`}>
                <img src={(top3[0] as any).profilePhoto || `https://picsum.photos/seed/${top3[0].id}/200/200`} className="w-full h-full object-cover" alt="1st" />
              </div>
              <div className={`absolute -bottom-2 -right-2 ${activeProgram === 'IDEIAS' ? 'bg-emerald-100 border-emerald-500' : 'bg-emerald-100 border-emerald-500'} w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg`}>🥇</div>
              <Trophy className="absolute -top-12 left-1/2 -translate-x-1/2 text-emerald-500 w-10 h-10 animate-bounce" />
            </div>
            <div className="text-center pt-2">
              <p className="font-black text-slate-900 uppercase text-sm">{(top3[0] as any).author || (top3[0] as any).nomineeName}</p>
              <p className={`${activeProgram === 'IDEIAS' ? 'text-emerald-600' : 'text-emerald-600'} font-black uppercase text-[10px] tracking-widest`}>{top3[0].votes || 0} VOTOS</p>
            </div>
            <div className={`w-full ${activeProgram === 'IDEIAS' ? 'bg-emerald-500' : 'bg-emerald-500'} h-48 rounded-t-[40px] shadow-lg flex items-center justify-center`}>
              <span className="text-5xl font-black text-white/40">1º</span>
            </div>
          </div>
        )}

        {/* Bronze - 3rd */}
        {top3[2] && (
          <div className="order-3 h-full flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`w-24 h-24 rounded-[32px] border-4 ${activeProgram === 'IDEIAS' ? 'border-emerald-100' : 'border-emerald-100'} overflow-hidden shadow-xl`}>
                <img src={(top3[2] as any).profilePhoto || `https://picsum.photos/seed/${top3[2].id}/200/200`} className="w-full h-full object-cover" alt="3rd" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-100 border-2 border-emerald-100 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md">🥉</div>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-800 uppercase text-xs">{(top3[2] as any).author || (top3[2] as any).nomineeName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{top3[2].votes || 0} Votos</p>
            </div>
            <div className={`w-full ${activeProgram === 'IDEIAS' ? 'bg-emerald-50 border-emerald-50' : 'bg-emerald-50 border-emerald-100'} h-24 rounded-t-[32px] border-x border-t flex items-center justify-center`}>
              <span className="text-4xl font-black opacity-20">3º</span>
            </div>
          </div>
        )}
      </div>

      {/* Lista Completa */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
             {activeProgram === 'IDEIAS' ? <Lightbulb className="text-emerald-600 w-5 h-5" /> : <Droplets className="text-emerald-600 w-5 h-5" />}
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Geral iGreen: {activeProgram.replace('_', ' ')}</h3>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Pesquisar..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-tight focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" />
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5 text-center">Rank</th>
                <th className="px-8 py-5">Colaborador / Candidato</th>
                <th className="px-8 py-5">Unidade / Setor</th>
                <th className="px-8 py-5 text-right">Total de Votos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentList.map((item, idx) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => activeProgram === 'IDEIAS' && onViewIdea(item.id)}
                >
                  <td className="px-8 py-5 text-center">
                    <span className={`text-xs font-black ${idx < 3 ? 'text-emerald-600' : 'text-slate-400'}`}>{idx + 1}º</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          <img src={(item as any).profilePhoto || `https://picsum.photos/seed/${item.id}/50/50`} className="w-full h-full object-cover" alt="Profile" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-800 uppercase group-hover:text-emerald-600 transition-colors">{(item as any).author || (item as any).nomineeName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">{(item as any).title || (item as any).justification}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{(item as any).area || (item as any).costCenter}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Users className="w-3 h-3 text-slate-300" />
                       <span className="text-sm font-black text-slate-900 tracking-tighter">{item.votes || 0}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
