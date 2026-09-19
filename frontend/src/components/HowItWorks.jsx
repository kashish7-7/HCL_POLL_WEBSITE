import React from 'react';
import { PenTool, Share2, Vote, Radio } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'CREATE',
      icon: PenTool,
      desc: 'Write your question and add answer options.',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      num: '02',
      title: 'SHARE',
      icon: Share2,
      desc: 'Copy your unique poll link and send it to your audience.',
      color: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      num: '03',
      title: 'VOTE',
      icon: Vote,
      desc: 'Your audience opens the link and submits their vote.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      num: '04',
      title: 'LIVE RESULTS',
      icon: Radio,
      desc: 'Everyone watching sees the results update instantly.',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2 block">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How PulseVote Works
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Create, share, vote, and watch live results in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-md transition-all duration-200"
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

                  <h3 className="font-bold text-lg text-slate-900 tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
