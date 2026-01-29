
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Lightbulb, ClipboardCheck, Trophy, Settings, LogOut, User, Search, Droplets, Menu, Vote, X, FlaskConical
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setCurrentView: (view: string) => void;
  userRole: UserRole;
  currentUser: string;
  userAvatar?: string;
  onLogout: () => void;
  isVotingPhase?: boolean;
  isManager?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setCurrentView, 
  userRole, 
  currentUser, 
  userAvatar, 
  onLogout,
  isVotingPhase,
  isManager
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: Object.values(UserRole) },
    { id: 'idea-list', label: 'Banco de Ideias', icon: Search, roles: [UserRole.GREEN_BELT, UserRole.COMITE, UserRole.ADMIN] },
    { id: 'submit', label: 'Nova Ideia', icon: Lightbulb, roles: [UserRole.COLABORADOR, UserRole.GREEN_BELT, UserRole.ADMIN] },
    { id: 'sangue-verde-submit', label: 'Indicação Sangue Verde', icon: Droplets, roles: Object.values(UserRole), needsManager: true },
    { id: 'evaluation', label: 'Classificação', icon: ClipboardCheck, roles: [UserRole.COMITE, UserRole.GREEN_BELT, UserRole.ADMIN] },
    { id: 'final-voting', label: 'Votação Aberta', icon: Vote, roles: Object.values(UserRole), highlight: isVotingPhase },
    { id: 'ranking', label: 'Ranking & Mural', icon: Trophy, roles: Object.values(UserRole) },
    { id: 'admin', label: 'Admin Gestão', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  const allowedItems = menuItems.filter(item => {
    if (item.id === 'final-voting' && !isVotingPhase && userRole !== UserRole.ADMIN) return false;
    if (item.id === 'sangue-verde-submit') return isManager || userRole === UserRole.ADMIN;
    return item.roles.includes(userRole);
  });

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] bg-slate-900 flex flex-col transition-all duration-300 border-r border-white/5
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-emerald-600 p-1.5 rounded-xl shadow-xl shadow-emerald-500/20 animate-bounce shrink-0">
              {!imgError ? (
                <img 
                  src="/IconeLAB.png" 
                  alt="Logo" 
                  className="w-7 h-7 object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <FlaskConical className="text-white w-5 h-5" />
              )}
            </div>
            {isSidebarOpen && (
              <span className="text-white font-black text-lg tracking-tight truncate animate-in fade-in slide-in-from-left-2 duration-300">
                InterLab
              </span>
            )}
          </div>
          {isMobile && isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} className="text-white/50 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 mt-4 overflow-y-auto">
          <ul className="space-y-2">
            {allowedItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    currentView === item.id 
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/30' 
                      : (item as any).highlight 
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${(item as any).highlight && currentView !== item.id ? 'animate-pulse' : ''}`} />
                  {isSidebarOpen && (
                    <span className="font-bold text-[10px] uppercase tracking-widest truncate animate-in fade-in duration-300">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            onClick={() => handleNavigate('profile')}
            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group ${
              currentView === 'profile' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
              {userAvatar ? (
                <img src={userAvatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            {isSidebarOpen && (
              <div className="text-left overflow-hidden animate-in fade-in duration-300">
                <p className="text-[10px] font-black uppercase tracking-tight truncate leading-none mb-1">{currentUser}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Meu Perfil</p>
              </div>
            )}
          </button>

          <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:bg-rose-600/10 hover:text-rose-500 transition-all">
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-bold text-[10px] uppercase tracking-widest animate-in fade-in duration-300">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 flex flex-col ${
        isSidebarOpen && !isMobile ? 'lg:pl-64' : 'lg:pl-20'
      }`}>
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">
              {menuItems.find(m => m.id === currentView)?.label || 'InterLab Portal'}
            </h1>
          </div>
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-tight">Unidade Intermarítima</span>
             <span className="text-xs text-emerald-600 font-black uppercase tracking-tighter flex items-center gap-1.5">
               <span className={`w-2 h-2 rounded-full ${isVotingPhase ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
               {isVotingPhase ? 'VOTAÇÃO EM ANDAMENTO' : 'SISTEMA ONLINE'}
             </span>
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-10 lg:p-12 w-full">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
