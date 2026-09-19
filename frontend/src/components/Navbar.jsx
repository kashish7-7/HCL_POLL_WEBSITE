import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react';

export const Navbar = ({ currentTab, setTab }) => {
  const { logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    setTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <img src="/logo.svg" alt="PollNow Logo" className="w-9 h-9 rounded-xl shadow-xs group-hover:scale-105 transition-transform" />
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Poll<span className="text-indigo-600">Now</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNav('home')}
            className={`hover:text-indigo-600 transition cursor-pointer ${currentTab === 'home' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className={`hover:text-indigo-600 transition cursor-pointer ${currentTab === 'how-it-works' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            How It Works
          </button>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNav(isAuthenticated ? 'create' : 'login')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Poll</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => handleNav('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer ${
                  currentTab === 'dashboard' ? 'bg-slate-100 border-slate-300' : ''
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition cursor-pointer ${
                currentTab === 'login' || currentTab === 'register' ? 'bg-slate-100' : ''
              }`}
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3 font-medium text-slate-700">
          <button
            onClick={() => handleNav('home')}
            className="block w-full text-left py-2 hover:text-indigo-600 font-semibold"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="block w-full text-left py-2 hover:text-indigo-600"
          >
            How It Works
          </button>

          {isAuthenticated && (
            <button
              onClick={() => handleNav('dashboard')}
              className="flex items-center gap-2 w-full text-left py-2 hover:text-indigo-600"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => handleNav(isAuthenticated ? 'create' : 'login')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Poll</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
