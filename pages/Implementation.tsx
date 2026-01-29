
import React from 'react';
import { Kanban, List, CheckCircle2, Clock, PlayCircle, UserPlus, FileText } from 'lucide-react';
import { Idea, IdeaType, ImplementationStatus } from '../types';

interface ImplementationProps {
  ideas: Idea[];
  // Added missing onViewIdea prop type
  onViewIdea: (id: string) => void;
}

export const Implementation: React.FC<ImplementationProps> = ({ ideas, onViewIdea }) => {
  const approvedIdeas = ideas.filter(i => 
    i.finalType === IdeaType.INOVADORA && 
    (i.rank === 'OURO' || i.rank === 'PRATA' || i.rank === 'BRONZE')
  );

  const getStatusColor = (status?: ImplementationStatus) => {
    switch(status) {
      case ImplementationStatus.PLANEJAMENTO: return 'bg-blue-100 text-blue-600';
      case ImplementationStatus.EM_EXECUCAO: return 'bg-amber-100 text-amber-600';
      case ImplementationStatus.CONCLUIDO: return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Acompanhamento de Implantação</h2>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button className="p-2 bg-slate-100 rounded-lg text-slate-800"><Kanban className="w-5 h-5"/></button>
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><List className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['PLANEJAMENTO', 'EM_EXECUCAO', 'CONCLUIDO'].map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                {status === 'PLANEJAMENTO' && <Clock className="w-4 h-4 text-blue-500" />}
                {status === 'EM_EXECUCAO' && <PlayCircle className="w-4 h-4 text-amber-500" />}
                {status === 'CONCLUIDO' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {status.replace('_', ' ')}
              </h3>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full">
                {approvedIdeas.filter(i => (i.implementationStatus || ImplementationStatus.PLANEJAMENTO) === status).length}
              </span>
            </div>

            <div className="space-y-4">
              {approvedIdeas
                .filter(i => (i.implementationStatus || ImplementationStatus.PLANEJAMENTO) === status)
                .map(idea => (
                <div 
                  key={idea.id} 
                  onClick={() => onViewIdea(idea.id)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-600 rounded-md tracking-widest uppercase">
                      ID-{idea.id.substring(0,6)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                      idea.rank === 'OURO' ? 'bg-amber-100 text-amber-600' :
                      idea.rank === 'PRATA' ? 'bg-slate-100 text-slate-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {idea.rank}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">{idea.title}</h4>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Agente</p>
                      <p className="text-xs font-bold text-slate-700">{idea.implementationAgent || 'Não Designado'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <button className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                      <FileText className="w-3 h-3" /> VER PLANO
                    </button>
                    <div className="flex -space-x-2">
                      {[1, 2].map(u => (
                        <div key={u} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                          <img src={`https://picsum.photos/seed/${idea.id + u}/50/50`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {approvedIdeas.filter(i => (i.implementationStatus || ImplementationStatus.PLANEJAMENTO) === status).length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center">
                  <p className="text-xs text-slate-400 font-medium italic">Nenhuma ideia nesta etapa</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
