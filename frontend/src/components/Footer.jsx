import React from 'react';
import { BarChart3 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Pulse<span className="text-indigo-500">Vote</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 text-center">
          HCL GUVI Developer Internship Application • Built with React, Go (Gin), MongoDB & Redis
        </p>

        <p className="text-xs text-slate-500">
          © 2026 PulseVote. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
