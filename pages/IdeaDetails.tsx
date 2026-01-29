
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Briefcase, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2,
  Share2,
  Printer,
  FileText,
  MessageSquare,
  BarChart3,
  Video,
  Send,
  Loader2,
  ExternalLink,
  Edit3,
  Play
} from 'lucide-react';
import { Idea, IdeaType, ImplementationStatus, IdeaFeedback, UserRole, CycleConfig } from '../types';
import { db, COLECOES, doc, updateDoc, arrayUnion } from '../firebase';
import { getLocalISODate } from '../utils/dateUtils';

interface IdeaDetailsProps {
  idea: Idea;
  onBack: () => void;
  currentUser: string;
  userRole: UserRole;
  cycleConfig: CycleConfig;
  onEdit?: (idea: Idea) => void;
}

export const IdeaDetails: React.FC<IdeaDetailsProps> = ({ idea, onBack, currentUser, userRole, cycleConfig, onEdit }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const canWriteFeedback = userRole !== UserRole.COLABORADOR;
  const isAuthor = idea.author === currentUser;
  
  const today = getLocalISODate();
  const isSubmissionOpen = today >= cycleConfig.submissionStart && today <= cycleConfig.submissionEnd;
  const canEdit = isAuthor && isSubmissionOpen;

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !canWriteFeedback) return;
    setSendingFeedback(true);
    try {
      const ideaRef = doc(db, COLECOES.IDEIAS, idea.id);
      const newFeedback: IdeaFeedback = { user: currentUser, text: feedbackText.trim(), date: new Date().toISOString() };
      await updateDoc(ideaRef, { feedbacks: arrayUnion(newFeedback) });
      setFeedbackText('');
    } catch (error) {
      alert("Erro ao enviar comentário.");
    } finally {
      setSendingFeedback(false);
    }
  };

  // Função para converter links comuns em links de incorporação (embed)
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // SharePoint / OneDrive (tentativa de conversão para visualização direta)
    if (url.includes('sharepoint.com')) {
      if (url.includes('action=embedview') || url.includes('embed')) return url;
      // Adiciona parâmetro de visualização se não existir
      return url.includes('?') ? `${url}&action=embedview` : `${url}?action=embedview`;
    }

    return url;
  };

  const embedUrl = getEmbedUrl(idea.videoUrl || '');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
        </button>

        <div className="flex items-center gap-3">
          {canEdit && (
            <button 
              onClick={() => onEdit?.(idea)}
              className="px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Editar Minha Proposta
            </button>
          )}
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"><Printer className="w-5 h-5" /></button>
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"><Share2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Lightbulb className="w-4 h-4" /> Ciclo iGreen {idea.cycle}/2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight uppercase tracking-tighter">{idea.title}</h1>
          <div className="flex flex-wrap items-center gap-6 pt-4 text-slate-400">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /><span className="text-xs font-bold">{idea.author}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span className="text-xs font-bold">{idea.area}</span></div>
          </div>
        </div>
        <Lightbulb className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      {/* Seção de Vídeo Integrado */}
      {idea.videoUrl && (
        <section className="bg-slate-950 rounded-[48px] overflow-hidden border border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Pitch do Inovador iGreen</h3>
            </div>
            <a href={idea.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 uppercase transition-colors">
              Abrir Original <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="aspect-video w-full bg-black relative group">
             {embedUrl ? (
               <iframe 
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                title="iGreen Pitch Video"
               ></iframe>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <Video className="w-16 h-16 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Previsualização não disponível</p>
               </div>
             )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[40px] border border-slate-200 p-8 md:p-10 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3"><AlertCircle className="w-6 h-6 text-rose-500" /> O Problema</h3>
            <p className="text-slate-600 leading-relaxed text-lg font-medium italic border-l-4 border-rose-100 pl-6">"{idea.problem}"</p>
          </section>
          <section className="bg-white rounded-[40px] border border-slate-200 p-8 md:p-10 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3"><Lightbulb className="w-6 h-6 text-emerald-500" /> Proposta iGreen</h3>
            <p className="font-bold text-slate-900 leading-relaxed">{idea.idea}</p>
          </section>
          
          <section className="bg-white rounded-[40px] border border-slate-200 p-8 md:p-10 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3"><FileText className="w-6 h-6 text-emerald-600" /> Como Implementar</h3>
            <div className="bg-slate-50 p-6 rounded-3xl text-sm text-slate-700 leading-relaxed">
              {idea.implementationDetails}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm space-y-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-4">Ficha Técnica</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><User className="w-5 h-5" /></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor(a)</p><p className="text-sm font-bold text-slate-800">{idea.author}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><ShieldCheck className="w-5 h-5" /></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentoria</p><p className="text-sm font-bold text-slate-800">{idea.greenBelt}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><TrendingUp className="w-5 h-5" /></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retorno Financeiro</p><p className="text-xs font-black text-emerald-700">{idea.financialReturn}</p></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm space-y-6">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" /> Feedbacks
             </h3>
             <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
               {(idea.feedbacks || []).map((fb, idx) => (
                 <div key={idx} className="bg-slate-50 p-4 rounded-2xl space-y-2">
                   <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase text-emerald-600">{fb.user.split(' ')[0]}</span>
                     <span className="text-[8px] font-bold text-slate-400">{new Date(fb.date).toLocaleDateString()}</span>
                   </div>
                   <p className="text-xs text-slate-600 italic">"{fb.text}"</p>
                 </div>
               ))}
               {(!idea.feedbacks || idea.feedbacks.length === 0) && (
                 <p className="text-[10px] text-slate-400 text-center py-4">Nenhum comentário ainda.</p>
               )}
             </div>

             {canWriteFeedback && (
               <form onSubmit={handleAddFeedback} className="relative pt-4">
                 <input 
                   type="text" 
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20" 
                   placeholder="Enviar feedback..."
                   value={feedbackText}
                   onChange={e => setFeedbackText(e.target.value)}
                 />
                 <button type="submit" disabled={sendingFeedback} className="absolute right-2 top-[24px] text-emerald-600 hover:text-emerald-500">
                    {sendingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                 </button>
               </form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
