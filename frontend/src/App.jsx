import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { PollView } from './pages/PollView';
import { CreatePoll } from './pages/CreatePoll';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function GazetteApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedPollId, setSelectedPollId] = useState(null);

  // Check URL parameters for shareable links (?poll=ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pollParam = params.get('poll');
    if (pollParam) {
      setSelectedPollId(pollParam);
      setCurrentTab('poll');
    }
  }, []);

  const handleSelectPoll = (pollId) => {
    setSelectedPollId(pollId);
    setCurrentTab('poll');
    window.history.pushState({}, '', `?poll=${pollId}`);
  };

  const handleBackToHome = () => {
    setSelectedPollId(null);
    setCurrentTab('home');
    window.history.pushState({}, '', window.location.pathname);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'poll':
        return <PollView pollId={selectedPollId} onBack={handleBackToHome} />;
      case 'create':
        return (
          <CreatePoll
            onCreated={(newPollId) => handleSelectPoll(newPollId)}
            onCancel={handleBackToHome}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            onSelectPoll={handleSelectPoll}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      case 'login':
        return (
          <Login
            onLoginSuccess={handleBackToHome}
            onNavigateRegister={() => setCurrentTab('register')}
          />
        );
      case 'register':
        return (
          <Register
            onRegisterSuccess={handleBackToHome}
            onNavigateLogin={() => setCurrentTab('login')}
          />
        );
      case 'home':
      default:
        return (
          <Home
            onSelectPoll={handleSelectPoll}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Header currentTab={currentTab} setTab={(tab) => {
          if (tab === 'home') handleBackToHome();
          else setCurrentTab(tab);
        }} />
        {renderContent()}
      </div>

      {/* Newspaper Footer */}
      <footer className="mt-12 border-t-4 border-double border-[#2c251e] bg-[#eedfc5] py-6 px-4 font-serif text-center text-xs text-[#4a423a]">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="font-bold uppercase tracking-widest text-[#1f1b18]">
            THE GAZETTE POLLETIN • HCL GUVI DEVELOPER INTERNSHIP TASK
          </p>
          <p className="italic">
            Engineered with React, Go (Gin), MongoDB & Redis Pub/Sub Telegraph Broadcast.
          </p>
          <p className="text-[10px] text-[#8b5e34]">
            © 1882 - 2026 Gazette Publishing House. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GazetteApp />
    </AuthProvider>
  );
}
