import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/sound';
import { Volume2, VolumeX, Newspaper, PenTool, LayoutDashboard, LogIn, LogOut, UserPlus } from 'lucide-react';

export const Header = ({ currentTab, setTab }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);

  const toggleAudio = () => {
    const isEnabled = soundFx.toggleSound();
    setSoundEnabled(isEnabled);
    if (isEnabled) {
      soundFx.playMechanicalClick();
    }
  };

  return (
    <header className="w-full mb-6">
      {/* Top Issue Metadata Strip */}
      <div className="flex flex-wrap justify-between items-center text-[11px] uppercase tracking-wider py-1 px-3 border-b-2 border-t-2 border-[#2c251e] bg-[#f0e4d0] font-serif font-bold text-[#4a423a]">
        <span>EST. 1882 • RE-PRINTED 2026</span>
        <span className="hidden sm:inline">THE SOVEREIGN ORGAN OF PUBLIC OPINION & LIVE VOTES</span>
        <div className="flex items-center gap-4">
          <span>VOL. CXLIV NO. 42</span>
          <button 
            onClick={toggleAudio}
            className="flex items-center gap-1.5 px-2 py-0.5 border border-[#2c251e] rounded hover:bg-[#e4d4b8] transition cursor-pointer text-[#2c251e]"
            title="Toggle Mechanical Telegraph Click Sound"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-900" />
                <span className="text-[10px]">SOUND: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[10px]">SOUND: MUTE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Newspaper Broadside Masthead */}
      <div className="py-6 px-4 text-center relative border-b-4 border-double border-[#2c251e] bg-[#f8f1e3]">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          {/* Left Woodcut Motif */}
          <div className="hidden md:block w-24 text-center opacity-85">
            <div className="border border-[#2c251e] p-1 font-serif text-[10px] uppercase bg-[#eedfc5]">
              <span className="block font-bold">CIRCULATION</span>
              <span className="text-xs">100,000+</span>
              <span className="block text-[8px]">DAILY READERS</span>
            </div>
          </div>

          {/* Title Banner */}
          <div className="flex-1">
            <div className="text-xs font-serif italic text-[#8b5e34] tracking-widest uppercase mb-1">
              ❖ The Daily Broadsheet & Live Polling Dispatch ❖
            </div>
            <h1 
              onClick={() => setTab('home')}
              className="masthead-title text-3xl sm:text-5xl md:text-6xl font-black text-[#1f1b18] cursor-pointer tracking-tight hover:opacity-90 transition font-serif"
            >
              THE GAZETTE POLLETIN
            </h1>
            <p className="text-xs sm:text-sm font-serif italic text-[#4a423a] mt-1">
              "Every Vote Counted Instantly Across the Globe via Redis & Go Telegraphic Engine"
            </p>
          </div>

          {/* Right Woodcut Motif */}
          <div className="hidden md:block w-24 text-center opacity-85">
            <div className="border border-[#2c251e] p-1 font-serif text-[10px] uppercase bg-[#eedfc5]">
              <span className="block font-bold">PRICE</span>
              <span className="text-xs">2 CENTS</span>
              <span className="block text-[8px]">FREE EDITION</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="border-b-2 border-[#2c251e] bg-[#eedfc5]">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center px-4 py-2">
          <div className="flex flex-wrap gap-2 sm:gap-4 font-serif text-xs font-bold uppercase tracking-wider text-[#1f1b18]">
            <button
              onClick={() => setTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 border transition cursor-pointer ${
                currentTab === 'home' 
                  ? 'bg-[#1f1b18] text-[#f6ebd6] border-[#1f1b18]' 
                  : 'border-[#2c251e] bg-[#f8f1e3] hover:bg-[#e6d6bc]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              Front Page
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => setTab('create')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border transition cursor-pointer ${
                    currentTab === 'create' 
                      ? 'bg-[#1f1b18] text-[#f6ebd6] border-[#1f1b18]' 
                      : 'border-[#2c251e] bg-[#f8f1e3] hover:bg-[#e6d6bc]'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-700" />
                  Publish Poll
                </button>

                <button
                  onClick={() => setTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border transition cursor-pointer ${
                    currentTab === 'dashboard' 
                      ? 'bg-[#1f1b18] text-[#f6ebd6] border-[#1f1b18]' 
                      : 'border-[#2c251e] bg-[#f8f1e3] hover:bg-[#e6d6bc]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Editor's Desk
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 font-serif text-xs font-bold">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline italic text-[#4a423a]">
                  Editor: <span className="underline font-bold text-[#1f1b18]">{user?.username}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-1 border border-[#2c251e] bg-[#e4d4b8] hover:bg-[#d8c4a4] transition cursor-pointer text-[#1f1b18]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setTab('login')}
                  className={`flex items-center gap-1 px-3 py-1 border transition cursor-pointer ${
                    currentTab === 'login' 
                      ? 'bg-[#1f1b18] text-[#f6ebd6] border-[#1f1b18]' 
                      : 'border-[#2c251e] bg-[#f8f1e3] hover:bg-[#e6d6bc]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => setTab('register')}
                  className={`flex items-center gap-1 px-3 py-1 border transition cursor-pointer ${
                    currentTab === 'register' 
                      ? 'bg-[#1f1b18] text-[#f6ebd6] border-[#1f1b18]' 
                      : 'border-[#2c251e] bg-[#f8f1e3] hover:bg-[#e6d6bc]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-800" />
                  Join Press
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
