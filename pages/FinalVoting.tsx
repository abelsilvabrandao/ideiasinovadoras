
import React, { useState, useEffect } from 'react';
import { Vote, Star, CheckCircle2, Info, Users, ShieldCheck, Rocket, Trophy, Droplets, Lightbulb, Loader2 } from 'lucide-react';
import { Idea, IdeaType, UserRole, SangueVerdeNomination } from '../types';
import { db, COLECOES, doc, updateDoc, collection, onSnapshot, query, orderBy } from '../firebase';

interface FinalVotingProps {
  ideas: Idea[];
  userRole: UserRole;
  onPublish: () => void;
  isPublished: boolean;
  onViewIdea: (id: string) => void;
}

export const FinalVoting: React.FC<FinalVotingProps> = ({ ideas, userRole, onPublish, isPublished, onViewIdea }) => {
  const [programFilter, setProgramFilter] = useState<'IDEIAS' | 'SANGUE_VERDE'>('IDEIAS');
  const [sangueNominations, setSangueNominations] = useState<SangueVerdeNomination[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);

  const innovativeIdeas = ideas.filter(i => i.finalType === IdeaType.INOVADORA);

  useEffect(() => {
    const q = query(collection(db, "sangue_verde_indicacoes"), orderBy("dateSubmitted", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setSangueNominations(snap.docs.map(d => ({ id: d.id, ...d.data() } as SangueVerdeNomination)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleVoteToggle = (id: string) => {
    if (selectedVotes.includes(id)) {
      setSelectedVotes(prev => prev.filter(vId => vId !== id));
    } else {
      if (selectedVotes.length < 3) setSelectedVotes(prev => [...prev, id]);
    }
  };

  const confirmVotes = async () => {
    setVoting(true);
    try {
      for (const id of selectedVotes) {
        if (programFilter === 'IDEIAS') {
          const idea = ideas.find(i => i.id === id);
          if (idea) await updateDoc(doc(db, COLECOES.IDEIAS, id), { votes: (idea.votes || 0) + 1 });
        } else {
          const nom = sangueNominations.find(n => n.id === id);
          if (nom) await updateDoc(doc(db, "sangue_verde_indicacoes", id), { votes: (nom.votes || 0) + 1 });
        }
      }
      setSelectedVotes([]);
      alert("Votos iGreen registrados com sucesso!");
    } catch (error) {
      alert("Falha ao registrar votos.");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <Vote className="text-emerald-600 w-8 h-8" /> Votação iGreen 2026
          </h2>
          <p className="text-slate-500 font-medium italic">Selecione até 3 candidatos iGreen para apoiar.</p>
        </div>
        <div className="flex p-1 bg-slate-200/50 rounded-2xl">
          <button onClick={() => { setProgramFilter('IDEIAS'); setSelectedVotes([]); }} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${programFilter === 'IDEIAS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}>Ideias Inovadoras</button>
          <button onClick={() => { setProgramFilter('SANGUE_VERDE'); setSelectedVotes([]); }} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${programFilter === 'SANGUE_VERDE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}>Sangue Verde</button>
        </div>
      </div>

      {programFilter === 'IDEIAS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {innovativeIdeas.map(idea => (
            <div key={idea.id} onClick={() => handleVoteToggle(idea.id)} className={`relative bg-white rounded-3xl border-2 p-6 transition-all cursor-pointer ${selectedVotes.includes(idea.id) ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden">
                  {idea.profilePhoto ? <img src={idea.profilePhoto} className="w-full h-full object-cover" /> : <Lightbulb className="w-6 h-6" />}
                </div>
                <div className={`p-2 rounded-xl ${selectedVotes.includes(idea.id) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                  <Star className={`w-5 h-5 ${selectedVotes.includes(idea.id) ? 'fill-current' : ''}`} />
                </div>
              </div>
              <h3 className="font-black text-slate-900 leading-tight mb-2 uppercase text-sm line-clamp-2">{idea.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{idea.author} • {idea.area}</p>
              <div className="flex items-center justify-between text-[10px] font-black">
                <span className="text-emerald-600">SCORE: {idea.finalScore.toFixed(2)}</span>
                <span className="text-slate-400">{idea.votes || 0} VOTOS</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sangueNominations.map(nom => (
            <div key={nom.id} onClick={() => handleVoteToggle(nom.id)} className={`relative bg-white rounded-3xl border-2 p-6 transition-all cursor-pointer ${selectedVotes.includes(nom.id) ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-[20px] flex items-center justify-center text-slate-400 overflow-hidden border-2 border-white shadow-md">
                  {nom.profilePhoto ? <img src={nom.profilePhoto} className="w-full h-full object-cover" /> : <Droplets className="w-8 h-8" />}
                </div>
                <div className={`p-2 rounded-xl ${selectedVotes.includes(nom.id) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                  <Star className={`w-5 h-5 ${selectedVotes.includes(nom.id) ? 'fill-current' : ''}`} />
                </div>
              </div>
              <h3 className="font-black text-slate-900 leading-tight mb-1 uppercase text-sm">{nom.nomineeName}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">CC: {nom.costCenter}</p>
              <p className="text-[10px] text-slate-500 line-clamp-3 italic mb-4">"{nom.justification}"</p>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span className="text-emerald-600">SANGUE VERDE</span>
                <span className="text-slate-400">{nom.votes || 0} VOTOS</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVotes.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-6">
          <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-2xl flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Sua Escolha iGreen</p>
              <p className="text-xl font-black">{selectedVotes.length} / 3 Selecionados</p>
            </div>
            <button onClick={confirmVotes} disabled={voting} className="bg-emerald-600 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2">
              {voting ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
