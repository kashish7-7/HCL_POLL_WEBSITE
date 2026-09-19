import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export const Hero = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  const handleCreateClick = () => {
    onNavigate(isAuthenticated ? 'create' : 'login');
  };

  const handleHowItWorksClick = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Powered by Go, Redis & WebSockets</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-6">
          Create polls. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
            Get answers instantly.
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Publish real-time interactive polls in seconds. Share your unique link and watch live audience results update automatically without page refreshes.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={handleCreateClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Create a Poll</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={handleHowItWorksClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 transition cursor-pointer"
          >
            See How It Works
          </button>
        </div>

        {/* Interactive Mock Poll Preview Card */}
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE REALTIME RESULTS
            </span>
            <span className="text-xs text-slate-400 font-mono">142 votes total</span>
          </div>

          <h3 className="font-bold text-lg text-white mb-4">
            What feature should we build next?
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>AI Chatbot Integration</span>
                <span className="font-bold text-indigo-400">52% (74 votes)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: '52%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Mobile App (iOS & Android)</span>
                <span className="font-bold text-slate-400">31% (44 votes)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500/80 rounded-full transition-all duration-700" style={{ width: '31%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Chrome Extension</span>
                <span className="font-bold text-slate-400">17% (24 votes)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full transition-all duration-700" style={{ width: '17%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
