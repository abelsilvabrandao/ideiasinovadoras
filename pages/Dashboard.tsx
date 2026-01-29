
import React from 'react';
import { 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Trophy,
  Lock,
  BarChart3,
  ShieldAlert,
  MessageSquare,
  User,
  ArrowRight
} from 'lucide-react';
import { Idea, UserRole, IdeaType, CycleConfig } from '../types';
import { formatLocalDate } from '../utils/dateUtils';

interface DashboardProps {
  ideas: Idea[];
  userRole: UserRole;
  currentUser: string;
  cycleConfig: CycleConfig;
  onViewIdea: (id: string) => void;
  onViewAll: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ ideas, userRole, currentUser, cycleConfig, onViewIdea, onViewAll }) => {
  const isManagement = userRole !== UserRole.COLABORADOR;
  const displayedIdeas = isManagement ? ideas : ideas.filter(i => i.author === currentUser);
  
  const innovativeCount = displayedIdeas.filter(i => i.finalType === IdeaType.INOVADORA).length;
  const pendingCount = displayedIdeas.filter(i => i.finalType === IdeaType.PENDENTE).length;
  const implementedCount = displayedIdeas.filter(i => i.implementationStatus === 'CONCLUIDO').length;
  
  const isRankingReleased = cycleConfig.isPublished || isManagement;

  const recentFeedbacks = ideas
    .flatMap(idea => (idea.feedbacks || []).map(fb => ({ 
      ...fb, 
      ideaId: idea.id, 
      ideaTitle: idea.title,
      ideaAuthor: idea.author 
    })))
    .filter(fb => fb.user === currentUser || fb.ideaAuthor === currentUser)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = isManagement ? [
    { label: 'Total Propostas', value: ideas.length, icon: BarChart3, color: 'bg-emerald-500' },
    { label: 'Aguardando', value: pendingCount, icon: Clock, color: 'bg-amber-500' },
    { label: 'Inovadoras', value: innovativeCount, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Implementadas', value: implementedCount, icon: CheckCircle2, color: 'bg-teal-500' },
  ] : [
    { label: 'Minhas Ideias', value: displayedIdeas.length, icon: Lightbulb, color: 'bg-emerald-500' },
    { label: 'Inovadoras', value: innovativeCount, icon: TrendingUp, color: 'bg-teal-500' },
    { label: 'Em Avaliação', value: pendingCount, icon: Clock, color: 'bg-amber-500' },
    { label: 'Implantadas', value: implementedCount, icon: CheckCircle2, color: 'bg-emerald-700' },
  ];

  return (
    <div className="space-y-10">
      {/* Top Section Grid - 4 Column Layout for better balance on wide screens */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className={`lg:col-span-3 p-8 sm:p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl transition-all ${
          isManagement ? 'bg-gradient-to-br from-emerald-800 to-slate-900' : 'bg-gradient-to-br from-emerald-600 to-emerald-800'
        }`}>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-4">
              Olá, {currentUser.split(' ')[0]}! 👋
              {isManagement && <ShieldAlert className="w-8 h-8 text-emerald-300 opacity-80" />}
            </h2>
            <p className="text-emerald-100/90 max-w-2xl text-base sm:text-lg font-medium leading-relaxed">
              {isManagement 
                ? 'Painel InterLab 2026: Analise propostas e impulsione a sustentabilidade na unidade. Seu papel é fundamental para transformar ideias em resultados extraordinários.'
                : 'Seja bem-vindo ao seu portal de inovação. Aqui você acompanha em tempo real o progresso de cada ideia sua enviada ao Programa InterLab.'}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20 flex flex-col justify-center min-w-[160px]">
                <p className="text-[10px] text-emerald-200 uppercase font-black tracking-widest mb-1">Fase Atual</p>
                <p className="text-2xl font-black uppercase tracking-tight truncate">{cycleConfig.quarter}º TRI</p>
                <p className="text-[10px] text-emerald-300 font-black uppercase opacity-80">{cycleConfig.phase?.replace('_', ' ') || 'Submissão'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20 flex flex-col justify-center min-w-[160px]">
                <p className="text-[10px] text-emerald-200 uppercase font-black tracking-widest mb-1">Ano Ativo</p>
                <p className="text-2xl font-black uppercase tracking-tight">{cycleConfig.year || '2026'}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl opacity-40"></div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <Trophy className="text-amber-500 w-6 h-6" />
              {cycleConfig.isPublished ? `Ranking ${cycleConfig.year}` : 'Parcial InterLab'}
            </h3>
            
            {isRankingReleased ? (
              <div className="space-y-5 flex-1">
                {ideas
                  .filter(i => i.finalType === IdeaType.INOVADORA)
                  .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                  .slice(0, 3)
                  .map((idea, idx) => (
                  <div key={idea.id} onClick={() => onViewIdea(idea.id)} className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                      idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}º
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{idea.title}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase truncate tracking-tighter">{idea.author}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-emerald-600 whitespace-nowrap">{idea.votes || 0} v</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                <Lock className="text-slate-300 w-10 h-10" />
                <div>
                  <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Em Apuração</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Revelação em breve</p>
                </div>
              </div>
            )}
          </div>
          
          <button onClick={onViewAll} className="w-full mt-6 py-4 text-xs font-black text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-emerald-100 transition-all uppercase tracking-[0.2em] active:scale-95">
            Ver Ranking Completo
          </button>
        </div>
      </div>

      {/* Stats Section - More compact gaps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              <stat.icon className="text-white w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest truncate mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lists Section - Main content flow */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {isManagement ? 'Recentemente Enviadas' : 'Minhas Últimas Propostas'}
            </h3>
            <button onClick={onViewAll} className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-emerald-100 transition-all uppercase tracking-widest">
              Ver Todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {displayedIdeas.length > 0 ? displayedIdeas.slice(0, 5).map((idea) => (
              <div 
                key={idea.id} 
                onClick={() => onViewIdea(idea.id)}
                className="px-8 py-6 flex items-center justify-between hover:bg-slate-50/80 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-5 overflow-hidden">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm ${
                    idea.finalType === IdeaType.INOVADORA ? 'bg-emerald-100 text-emerald-600' : 
                    idea.finalType === IdeaType.PENDENTE ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">{idea.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      {isManagement && <span className="font-black text-slate-700 uppercase tracking-tighter">{idea.author.split(' ')[0]}</span>}
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="font-mono">{formatLocalDate(idea.dateSubmitted)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 ml-4">
                  <span className={`hidden sm:inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    idea.finalType === IdeaType.INOVADORA ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    idea.finalType === IdeaType.PENDENTE ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {idea.finalType.replace('_', ' ')}
                  </span>
                  <ChevronRight className="text-slate-300 w-6 h-6 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-slate-400 bg-slate-50/50">
                <p className="text-sm font-bold uppercase tracking-widest italic opacity-60">Nenhuma ideia encontrada.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side panel for communications */}
        <div className="lg:col-span-1 bg-white rounded-[40px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-3 uppercase tracking-[0.2em]">
              <MessageSquare className="text-emerald-600 w-4 h-4" />
              Conversas
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[600px] scrollbar-thin">
            {recentFeedbacks.length > 0 ? recentFeedbacks.map((fb, idx) => {
              const isSentByMe = fb.user === currentUser;
              return (
                <div 
                  key={idx} 
                  onClick={() => onViewIdea(fb.ideaId)}
                  className={`space-y-3 cursor-pointer group p-5 rounded-[28px] transition-all border ${
                    isSentByMe ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300' : 'bg-teal-50/30 border-teal-100 hover:border-teal-300'
                  } hover:shadow-md hover:-translate-y-0.5`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${
                      isSentByMe ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white'
                    }`}>
                      {isSentByMe ? 'Enviado' : 'Recebido'}
                    </span>
                    <span className="text-[8px] font-black text-slate-400 shrink-0 uppercase tracking-widest">
                      {formatLocalDate(fb.date.split('T')[0])}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium italic line-clamp-2 border-l-2 border-slate-200 pl-3 group-hover:border-emerald-400 transition-colors">
                    "{fb.text}"
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-white">
                       <User className="w-full h-full p-1 text-slate-400" />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate">
                      {isSentByMe ? `Para: ${fb.ideaAuthor.split(' ')[0]}` : `De: ${fb.user.split(' ')[0]}`}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                <MessageSquare className="w-8 h-8 text-slate-200 mb-3" />
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">
                  Nenhum feedback registrado
                </p>
              </div>
            )}
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
               Central de Comunicação InterLab
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
