import React from 'react';
import { Cpu, Database, RefreshCw, Radio, ShieldCheck } from 'lucide-react';

export const RealtimeExplanation = () => {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
            UNDER THE HOOD
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Driven by Redis & WebSockets
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Learn how Redis handles high-speed vote counting while pushing instantaneous telemetry to connected browser clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">1. Redis Atomic Hashes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              When a vote arrives, Redis runs <code className="text-emerald-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">HINCRBY poll:id:counts</code> in under 1ms, eliminating race conditions under heavy traffic.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">2. Redis Pub/Sub Broadcast</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The backend publishes the updated count to channel <code className="text-indigo-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">poll:id:updates</code>. The Go WebSocket Hub relays the JSON payload to all connected clients.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">3. MongoDB Persistent Audit</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              While Redis handles high-speed realtime counters, MongoDB asynchronously persists vote audit records and user profiles as the durable source of truth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
