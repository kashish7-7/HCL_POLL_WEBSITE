import React from 'react';
import { Zap, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

export const FeatureSection = ({ onSeeHowItWorks }) => {
  return (
    <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Realtime Architecture</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Built for live results
        </h2>
        <p className="text-lg sm:text-xl text-slate-300 max-w-xl mx-auto mb-12">
          Every vote appears instantly across all connected devices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-white mb-1">No refresh required</h3>
            <p className="text-xs text-slate-400">WebSocket connections update client state in real time.</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center">
            <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-white mb-1">No waiting time</h3>
            <p className="text-xs text-slate-400">Redis atomic counters increment tallies in under 1 millisecond.</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-white mb-1">Just real-time results</h3>
            <p className="text-xs text-slate-400">Pure low-latency Pub/Sub event streams directly to audience browsers.</p>
          </div>
        </div>

        <button
          onClick={onSeeHowItWorks}
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          See how it works
        </button>
      </div>
    </section>
  );
};
