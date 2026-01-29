
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Lightbulb, 
  User, 
  Building, 
  Calendar, 
  ChevronRight,
  Database,
  BarChart2,
  ListFilter
} from 'lucide-react';
import { Idea, IdeaType, UserRole } from '../types';

interface IdeaListProps {
  ideas: Idea[];
  userRole: UserRole;
  currentUser: string;
  onViewIdea: (id: string) => void;
}

export const IdeaList: React.FC<IdeaListProps> = ({ ideas, userRole, currentUser, onViewIdea }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');

  const isColaborador = userRole === UserRole.COLABORADOR;

  const baseIdeas = isColaborador 
    ? ideas.filter(i => i.author === currentUser) 
    : ideas;

  const areas = Array.from(new Set(baseIdeas.map(i => i.area))).sort();

  const filteredIdeas = baseIdeas.filter(idea => {
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.problem.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || idea.finalType === statusFilter;
    const matchesArea = areaFilter === 'ALL' || idea.area === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            {isColaborador ? 'Minhas Ideias iGreen' : 'Banco de Ideias iGreen'}
          </h2>
          <p className="text-slate-500 font-medium">
            {isColaborador 
              ? 'Acompanhe o histórico e o status de todas as suas propostas submetidas no portal iGreen.' 
              : 'Repositório completo de todas as propostas iGreen submetidas.'}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <Database className="w-5 h-5 text-emerald-500" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isColaborador ? 'Meus Registros' : 'Registros Totais'}
            </span>
            <span className="text-xl font-black text-slate-900">{baseIdeas.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Pesquisar por título, autor ou problema..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold appearance-none outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Status: Todos</option>
              {Object.values(IdeaType).map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {!isColaborador && (
            <div className="relative w-full md:w-48">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold appearance-none outline-none"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <option value="ALL">Área: Todas</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-6">Ideia / Título</th>
                {!isColaborador && <th className="px-8 py-6">Inovador(a)</th>}
                <th className="px-8 py-6">Unidade</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Data</th>
                <th className="px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIdeas.length > 0 ? filteredIdeas.map((idea) => (
                <tr 
                  key={idea.id} 
                  className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                  onClick={() => onViewIdea(idea.id)}
                >
                  <td className="px-8 py-6 max-w-md">
                    <p className="font-bold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-1">{idea.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-1">{idea.problem}</p>
                  </td>
                  {!isColaborador && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">
                          {idea.author.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{idea.author}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{idea.area}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      idea.finalType === IdeaType.INOVADORA ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      idea.finalType === IdeaType.PENDENTE ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      idea.finalType === IdeaType.MELHORIA_CONTINUA ? 'bg-emerald-50/20 text-emerald-700 border-emerald-100' :
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {idea.finalType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{new Date(idea.dateSubmitted).toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors inline-block" />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <BarChart2 className="w-12 h-12 text-slate-200" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Nenhuma ideia encontrada</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
