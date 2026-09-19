import React from 'react';
import { BarChart3 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="PollNow Logo" className="w-8 h-8 rounded-lg shadow-xs" />
          <span className="font-extrabold text-lg tracking-tight text-white">
            Poll<span className="text-indigo-500">Now</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 text-center">
          HCL GUVI Developer Internship Application • Built with React, Go (Gin), MongoDB & Redis
        </p>

        <p className="text-xs text-slate-500">
          © 2026 PollNow. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
