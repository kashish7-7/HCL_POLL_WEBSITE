import React from 'react';
import { Zap, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

export const FeatureSection = ({ onSeeHowItWorks }) => {
  return (
    <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Realtime Architecture</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Built for live results
        </h2>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-14">
          Every vote appears instantly across all connected devices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-14">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 text-center hover:border-slate-600 transition">
            <RefreshCw className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-white mb-2">No refresh required</h3>
            <p className="text-sm text-slate-400 leading-relaxed">WebSocket connections update client state in real time without refreshing.</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 text-center hover:border-slate-600 transition">
            <Clock className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-white mb-2">No waiting time</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Redis atomic counters increment tallies in under 1 millisecond.</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 text-center hover:border-slate-600 transition">
            <CheckCircle2 className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-white mb-2">Just real-time results</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Pure low-latency Pub/Sub event streams directly to audience browsers.</p>
          </div>
        </div>

        <button
          onClick={onSeeHowItWorks}
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          See how it works
        </button>
      </div>
    </section>
  );
};
