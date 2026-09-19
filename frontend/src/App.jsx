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
import { HowItWorksPage } from './pages/HowItWorksPage';

function PollNowApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [isCreatorView, setIsCreatorView] = useState(false);

  useEffect(() => {
    // Update document title per tab
    switch (currentTab) {
      case 'home':
        document.title = 'PollNow - Real-Time Audience Polling';
        break;
      case 'how-it-works':
        document.title = 'How It Works | PollNow';
        break;
      case 'login':
        document.title = 'Login | PollNow';
        break;
      case 'register':
        document.title = 'Register | PollNow';
        break;
      case 'dashboard':
        document.title = 'Dashboard | PollNow';
        break;
      case 'create':
        document.title = 'Create Poll | PollNow';
        break;
      case 'poll':
        document.title = selectedPollId ? (isCreatorView ? `Results #${selectedPollId} | PollNow` : `Poll #${selectedPollId} | PollNow`) : 'Poll | PollNow';
        break;
      default:
        document.title = 'PollNow - Real-Time Audience Polling';
    }
  }, [currentTab, selectedPollId, isCreatorView]);

  useEffect(() => {
    // Check path for /dashboard/poll/:id or /poll/:id or /how-it-works or query parameter ?poll=id
    const pathname = window.location.pathname;
    if (pathname === '/how-it-works') {
      setCurrentTab('how-it-works');
      return;
    }
    if (pathname.startsWith('/dashboard/poll/')) {
      const id = pathname.split('/dashboard/poll/')[1];
      if (id) {
        setSelectedPollId(id);
        setIsCreatorView(true);
        setCurrentTab('poll');
        return;
      }
    } else if (pathname.startsWith('/poll/')) {
      const id = pathname.split('/poll/')[1];
      if (id) {
        setSelectedPollId(id);
        setIsCreatorView(false);
        setCurrentTab('poll');
        return;
      }
    }

    const params = new URLSearchParams(window.location.search);
    const pollParam = params.get('poll');
    if (pollParam) {
      setSelectedPollId(pollParam);
      setIsCreatorView(false);
      setCurrentTab('poll');
    }
  }, []);

  const handleSelectPoll = (pollId, isCreator = false) => {
    setSelectedPollId(pollId);
    setIsCreatorView(isCreator);
    setCurrentTab('poll');
    const path = isCreator ? `/dashboard/poll/${pollId}` : `/poll/${pollId}`;
    window.history.pushState({}, '', path);
  };

  const handleBackToHome = () => {
    setSelectedPollId(null);
    setIsCreatorView(false);
    setCurrentTab('home');
    window.history.pushState({}, '', '/');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'how-it-works':
        return (
          <HowItWorksPage
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      case 'poll':
        return (
          <Poll
            pollId={selectedPollId}
            isCreatorView={isCreatorView}
            onBack={handleBackToHome}
          />
        );
      case 'create':
        return (
          <CreatePoll
            onCreated={(newPollId) => handleSelectPoll(newPollId, true)}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            onSelectPoll={(pollId, isCreator) => handleSelectPoll(pollId, isCreator)}
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
      <PollNowApp />
    </AuthProvider>
  );
}
