import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreatePoll } from './pages/CreatePoll';
import { Dashboard } from './pages/Dashboard';
import { Poll } from './pages/Poll';

function PulseVoteApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedPollId, setSelectedPollId] = useState(null);

  useEffect(() => {
    // Check path for /poll/:id or query parameter ?poll=id
    const pathname = window.location.pathname;
    if (pathname.startsWith('/poll/')) {
      const id = pathname.split('/poll/')[1];
      if (id) {
        setSelectedPollId(id);
        setCurrentTab('poll');
        return;
      }
    }

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
    window.history.pushState({}, '', `/poll/${pollId}`);
  };

  const handleBackToHome = () => {
    setSelectedPollId(null);
    setCurrentTab('home');
    window.history.pushState({}, '', '/');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'poll':
        return <Poll pollId={selectedPollId} onBack={handleBackToHome} />;
      case 'create':
        return (
          <CreatePoll
            onCreated={(newPollId) => handleSelectPoll(newPollId)}
            onNavigate={(tab) => setCurrentTab(tab)}
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
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar
          currentTab={currentTab}
          setTab={(tab) => {
            if (tab === 'home') handleBackToHome();
            else setCurrentTab(tab);
          }}
        />
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PulseVoteApp />
    </AuthProvider>
  );
}
