
import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Star, 
  Shield, 
  DollarSign, 
  Zap, 
  Scale, 
  Layers, 
  User, 
  MapPin, 
  Phone, 
  Target, 
  AlertCircle,
  TrendingUp,
  Briefcase,
  Lightbulb
} from 'lucide-react';
import { Idea, IdeaType, Evaluation } from '../types';
import { CRITERIA_DEFINITIONS } from '../constants';
import { db, COLECOES, doc, updateDoc } from '../firebase';

interface EvaluationPageProps {
  ideas: Idea[];
  onViewIdea: (id: string) => void;
}

export const EvaluationPage: React.FC<EvaluationPageProps> = ({ ideas, onViewIdea }) => {
  const pendingIdeas = ideas.filter(i => i.finalType === IdeaType.PENDENTE);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [evalType, setEvalType] = useState<IdeaType>(IdeaType.INOVADORA);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [justification, setJustification] = useState('');
  const [relevanceScore, setRelevanceScore] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores(prev => ({ ...prev, [criterionId]: value }));
  };

  const calculateWeightedAverage = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    CRITERIA_DEFINITIONS.forEach(c => {
      const score = scores[c.id] || 1;
      totalWeightedScore += score * c.weight;
      totalWeight += c.weight;
    });
    return totalWeightedScore / totalWeight;
  };

  const handleFinishEvaluation = async () => {
    if (!selectedIdea) return;
    setSaving(true);

    try {
      const newEvaluation: any = {
        evaluatorId: 'GESTOR-SESSAO',
        type: evalType,
        date: new Date().toISOString()
      };

      if (evalType === IdeaType.INOVADORA) {
        newEvaluation.scores = Object.entries(scores).map(([id, val]) => ({ 
          criterionId: id, 
          score: val as number 
        }));
      } else if (evalType === IdeaType.MELHORIA_CONTINUA) {
        newEvaluation.relevanceScore = relevanceScore;
        if (justification) newEvaluation.justification = justification;
      } else if (evalType === IdeaType.NAO_APLICAVEL) {
        if (justification) newEvaluation.justification = justification;
      }

      const finalScore = evalType === IdeaType.INOVADORA ? calculateWeightedAverage() : 0;
      const ideaRef = doc(db, COLECOES.IDEIAS, selectedIdea.id);

      await updateDoc(ideaRef, {
        finalType: evalType,
        evaluations: [newEvaluation as Evaluation],
        finalScore: finalScore
      });

      setSelectedIdea(null);
      setScores({});
      setJustification('');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao atualizar banco de dados. Verifique os campos obrigatórios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {!selectedIdea ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Fila de Avaliação iGreen</h2>
            <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              {pendingIdeas.length} Pendentes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingIdeas.map(idea => (
              <div key={idea.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col group h-full">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      {idea.profilePhoto ? (
                        <img src={idea.profilePhoto} className="w-full h-full object-cover" alt={idea.author} />
                      ) : (
                        <User className="text-slate-300 w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{idea.author}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{idea.sector}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors cursor-pointer" onClick={() => onViewIdea(idea.id)}>{idea.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 italic">
                    "{idea.problem}"
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedIdea(idea)}
                  className="mt-6 w-full py-4 bg-slate-50 text-slate-900 text-xs font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest border border-slate-100"
                >
                  Analisar Proposta
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6">
          <button onClick={() => setSelectedIdea(null)} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-800 transition-colors">
            ← Voltar para Fila
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl space-y-10">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg">Dados da Proposta iGreen</span>
                  <h2 className="text-4xl font-black text-slate-900 leading-tight">{selectedIdea.title}</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Matrícula</p>
                      <p className="text-xs font-black text-slate-700">{selectedIdea.registration}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Contato</p>
                      <p className="text-xs font-black text-slate-700">{selectedIdea.phone}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Green Belt</p>
                      <p className="text-xs font-black text-slate-700">{selectedIdea.greenBelt}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Gestor</p>
                      <p className="text-xs font-black text-slate-700">{selectedIdea.manager}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 text-slate-700">
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase">
                      <AlertCircle className="w-4 h-4 text-rose-500" /> O Problema
                    </h4>
                    <p className="text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl italic">{selectedIdea.problem}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase">
                      <Lightbulb className="w-4 h-4 text-amber-500" /> Solução iGreen
                    </h4>
                    <p className="text-sm leading-relaxed p-4 border border-slate-100 rounded-2xl font-medium">{selectedIdea.idea}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase">Implementação</h4>
                      <p className="text-xs leading-relaxed p-4 bg-slate-50 rounded-2xl">{selectedIdea.implementationDetails}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase">Retorno Financeiro</h4>
                      <p className="text-xs leading-relaxed p-4 bg-emerald-50 text-emerald-800 rounded-2xl font-bold">{selectedIdea.financialReturn}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl sticky top-24">
                <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3">
                  <ClipboardCheck className="text-emerald-500" /> Classificação
                </h3>

                <div className="space-y-4 mb-8">
                  {[
                    { id: IdeaType.INOVADORA, label: 'Inovadora', icon: TrendingUp },
                    { id: IdeaType.MELHORIA_CONTINUA, label: 'Melhoria', icon: Briefcase },
                    { id: IdeaType.NAO_APLICAVEL, label: 'Não Aplicável', icon: AlertCircle }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setEvalType(type.id)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 border-2 transition-all ${
                        evalType === type.id 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="font-bold uppercase text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>

                {evalType === IdeaType.INOVADORA ? (
                  <div className="space-y-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Notas por Critério (1 a 3)</p>
                    <div className="grid grid-cols-1 gap-2">
                      {CRITERIA_DEFINITIONS.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-300 uppercase">{c.label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map(v => (
                              <button 
                                key={v}
                                onClick={() => handleScoreChange(c.id, v)}
                                className={`w-6 h-6 rounded-md text-[10px] font-black transition-all ${
                                  (scores[c.id] || 1) === v ? 'bg-emerald-500 text-white scale-110 shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-400">Score Ponderado</span>
                      <span className="text-2xl font-black text-emerald-400">{calculateWeightedAverage().toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Justificativa da Gestão</label>
                    <textarea 
                      rows={4} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-white"
                      placeholder="Explique o motivo desta classificação..."
                      value={justification}
                      onChange={e => setJustification(e.target.value)}
                    ></textarea>
                  </div>
                )}

                <button 
                  onClick={handleFinishEvaluation}
                  disabled={saving || (evalType !== IdeaType.INOVADORA && !justification)}
                  className="w-full mt-8 py-5 bg-emerald-600 text-white font-black rounded-[20px] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-30 uppercase tracking-widest text-sm"
                >
                  {saving ? 'Gravando...' : 'Finalizar Análise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
