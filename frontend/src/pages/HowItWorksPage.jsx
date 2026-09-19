import React from 'react';
import { PenTool, Share2, Vote, Radio, PlusCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HowItWorksPage = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      num: '01',
      title: 'CREATE',
      icon: PenTool,
      desc: 'Create your poll question, add answer options, and set an optional opening/closing schedule.',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      num: '02',
      title: 'SHARE',
      icon: Share2,
      desc: 'Copy your unique public poll link and share it with your audience across any channel.',
      color: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      num: '03',
      title: 'VOTE',
      icon: Vote,
      desc: 'Your audience opens the link on any device and submits their vote in one click.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      num: '04',
      title: 'LIVE RESULTS',
      icon: Radio,
      desc: 'Everyone watching sees option vote counts and percentages update instantly in real time via WebSockets.',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
  ];

  return (
    <div className="py-12 lg:py-20 bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2 block">
            HOW POLLNOW WORKS
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Create. Share. Vote. <br className="hidden sm:inline" />
            <span className="text-indigo-600">See results live.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            PollNow provides ultra-low latency real-time audience feedback backed by MongoDB & Redis. Here is how simple it is to get started in 4 steps.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${step.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-300">
                      {step.num}
                    </span>
                  </div>

                  <h2 className="font-bold text-xl text-slate-900 tracking-tight mb-2">
                    {step.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Ready to create your first live poll?
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Launch a poll in under 30 seconds and start gathering instant audience votes.
          </p>
          <button
            onClick={() => onNavigate(isAuthenticated ? 'create' : 'login')}
            className="px-8 py-3.5 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-base transition shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create a Poll</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
