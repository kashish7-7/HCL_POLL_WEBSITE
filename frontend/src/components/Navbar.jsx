import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, PlusCircle, LayoutDashboard, LogIn, LogOut, UserCheck } from 'lucide-react';

export const Navbar = ({ currentTab, setTab }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Brand Logo */}
        <div 
          onClick={() => setTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Pulse<span className="text-indigo-600">Vote</span>
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setTab('home')}
            className={`hover:text-indigo-600 transition ${currentTab === 'home' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setTab('home');
              setTimeout(() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-indigo-600 transition"
          >
            How It Works
          </button>
        </div>

        {/* User Auth Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab(isAuthenticated ? 'create' : 'login')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Create Poll
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer ${
                  currentTab === 'dashboard' ? 'bg-slate-100 border-slate-300' : ''
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                Dashboard
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTab('login')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer ${
                currentTab === 'login' || currentTab === 'register' ? 'bg-slate-100' : ''
              }`}
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
