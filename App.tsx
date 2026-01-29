
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SubmitIdea } from './pages/SubmitIdea';
import { EvaluationPage } from './pages/Evaluation';
import { Ranking } from './pages/Ranking';
import { FinalVoting } from './pages/FinalVoting';
import { AdminManagement } from './pages/AdminManagement';
import { IdeaDetails } from './pages/IdeaDetails';
import { Profile } from './pages/Profile';
import { IdeaList } from './pages/IdeaList';
import { SangueVerdeSubmit } from './pages/SangueVerdeSubmit';
import { UserRole, Idea, ProgramType, CycleConfig, UserAccount, CyclePhase } from './types';
import { db, COLECOES, collection, onSnapshot, query, orderBy, doc } from './firebase';
import { CALENDARIO_OFICIAL_2026 } from './constants';

function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('ideias_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  
  const [configIdeias, setConfigIdeias] = useState<CycleConfig>(CALENDARIO_OFICIAL_2026.find(c => c.program === ProgramType.IDEIAS)!);
  const [configSangue, setConfigSangue] = useState<CycleConfig>(CALENDARIO_OFICIAL_2026.find(c => c.program === ProgramType.SANGUE_VERDE)!);

  useEffect(() => {
    if (currentUser) localStorage.setItem('ideias_user', JSON.stringify(currentUser));
    else localStorage.removeItem('ideias_user');
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribeIdeias = onSnapshot(query(collection(db, COLECOES.IDEIAS), orderBy("dateSubmitted", "desc")), (snap) => {
      setIdeas(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Idea[]);
    });

    const unsubscribeConfigs = onSnapshot(collection(db, COLECOES.CICLOS), (snap) => {
      snap.docs.forEach(d => {
        if (d.id === 'atual_ideias') setConfigIdeias(d.data() as CycleConfig);
        else if (d.id === 'atual_sangue') setConfigSangue(d.data() as CycleConfig);
      });
    });

    return () => {
      unsubscribeIdeias();
      unsubscribeConfigs();
    };
  }, [currentUser]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === UserRole.ADMIN) setCurrentView('admin');
    else setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const renderView = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case 'dashboard': return <Dashboard ideas={ideas} userRole={currentUser.role} currentUser={currentUser.name} cycleConfig={configIdeias} onViewIdea={id => { setSelectedIdeaId(id); setCurrentView('idea-details'); }} onViewAll={() => setCurrentView('idea-list')} />;
      case 'idea-list': return <IdeaList ideas={ideas} userRole={currentUser.role} currentUser={currentUser.name} onViewIdea={id => { setSelectedIdeaId(id); setCurrentView('idea-details'); }} />;
      case 'submit': return <SubmitIdea user={currentUser} cycleConfig={configIdeias} />;
      case 'sangue-verde-submit': return <SangueVerdeSubmit user={currentUser} cycleConfig={configSangue} />;
      case 'evaluation': return <EvaluationPage ideas={ideas} onViewIdea={id => { setSelectedIdeaId(id); setCurrentView('idea-details'); }} />;
      case 'ranking': return <Ranking ideas={ideas} userRole={currentUser.role} isPublished={configIdeias.isPublished} onViewIdea={id => { setSelectedIdeaId(id); setCurrentView('idea-details'); }} />;
      case 'final-voting': return <FinalVoting ideas={ideas} userRole={currentUser.role} onPublish={() => {}} isPublished={configIdeias.isPublished} onViewIdea={id => { setSelectedIdeaId(id); setCurrentView('idea-details'); }} />;
      case 'admin': return <AdminManagement />;
      // Fix: Use currentView state variable instead of setCurrentView setter function for comparison
      case 'profile': return <Profile user={currentUser} onUpdateUser={currentView === 'profile' ? setCurrentUser : () => {}} />;
      case 'idea-details':
        const idea = ideas.find(i => i.id === selectedIdeaId);
        if (!idea) return null;
        return <IdeaDetails idea={idea} onBack={() => setCurrentView('idea-list')} currentUser={currentUser.name} userRole={currentUser.role} cycleConfig={configIdeias} />;
      default: return <Dashboard ideas={ideas} userRole={currentUser.role} currentUser={currentUser.name} cycleConfig={configIdeias} onViewIdea={id => { setSelectedIdeaId(id); setCurrentView('idea-details'); }} onViewAll={() => setCurrentView('idea-list')} />;
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={setCurrentView} 
      userRole={currentUser.role} 
      currentUser={currentUser.name} 
      userAvatar={currentUser.profilePhoto}
      isManager={currentUser.isManager}
      onLogout={handleLogout}
      isVotingPhase={configIdeias.phase === CyclePhase.VOTACAO_FINAL || configSangue.phase === CyclePhase.VOTACAO_FINAL}
    >
      {renderView()}
    </Layout>
  );
}

export default App;
