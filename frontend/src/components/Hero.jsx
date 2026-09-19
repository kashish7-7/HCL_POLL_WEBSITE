import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ArrowRight, Plus, Trash2, Check, Copy, Palette, Settings as SettingsIcon, Share2, Sparkles, AlertCircle } from 'lucide-react';

export const Hero = ({ onNavigate, onPollCreated }) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('poll'); // 'poll' | 'theme' | 'settings' | 'share'
  const [question, setQuestion] = useState('What should we build next?');
  const [options, setOptions] = useState(['AI Chatbot', 'Mobile App', 'Chrome Extension']);
  const [selectedTheme, setSelectedTheme] = useState('indigo');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPollId, setCreatedPollId] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleOptionChange = (idx, val) => {
    const newOpts = [...options];
    newOpts[idx] = val;
    setOptions(newOpts);
  };

  const addOptionRow = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOptionRow = (idx) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleCreatePoll = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    if (!isAuthenticated) {
      onNavigate('login');
      setLoading(false);
      return;
    }

    if (!question.trim()) {
      setError('Please enter a poll question');
      setLoading(false);
      return;
    }

    const cleanOpts = options.map(o => o.trim()).filter(o => o.length > 0);
    if (cleanOpts.length < 2) {
      setError('Please provide at least 2 non-empty options');
      setLoading(false);
      return;
    }

    try {
      const res = await api.createPoll({
        question: question.trim(),
        options: cleanOpts,
      });

      setCreatedPollId(res.poll.id);
      setActiveTab('share');
      if (onPollCreated) {
        onPollCreated(res.poll.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const getShareURL = () => {
    return createdPollId ? `${window.location.origin}/poll/${createdPollId}` : `${window.location.origin}/poll/demo`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareURL());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Main Hero Headlines matching Sections #3 & #5 */}
        <div className="max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Real-Time Live Polling Engine</span>
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none mb-4">
            Create polls. <br className="hidden sm:inline" />
            <span className="text-indigo-600">Get answers instantly.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Create a live poll, share it with your audience, and watch responses update in real time without refreshing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'create' : 'login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Create a Poll</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-semibold text-base transition cursor-pointer"
            >
              How It Works
            </button>
          </div>
        </div>

        {/* Interactive Poll Maker Card Component matching Section #3 */}
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left">
          {/* Top Tabs Bar */}
          <div className="grid grid-cols-4 bg-slate-100/80 border-b border-slate-200 text-center font-medium text-slate-600 text-sm">
            <button
              onClick={() => setActiveTab('poll')}
              className={`py-3.5 transition border-b-2 cursor-pointer font-semibold ${
                activeTab === 'poll'
                  ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                  : 'hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              Poll
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`py-3.5 transition border-b-2 cursor-pointer font-semibold ${
                activeTab === 'theme'
                  ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                  : 'hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              Theme
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3.5 transition border-b-2 cursor-pointer font-semibold ${
                activeTab === 'settings'
                  ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                  : 'hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`py-3.5 transition border-b-2 cursor-pointer font-semibold ${
                activeTab === 'share'
                  ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                  : 'hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              Share
            </button>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: POLL TAB */}
            {activeTab === 'poll' && (
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Question
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What should we build next?"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-sans"
                    maxLength={300}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Options
                  </label>
                  <div className="space-y-2.5">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-sans"
                          required
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionRow(idx)}
                            className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {options.length < 10 && (
                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer pt-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Answer Option</span>
                  </button>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base transition shadow-md shadow-indigo-600/20 cursor-pointer flex justify-center items-center gap-2 font-sans"
                  >
                    <span>{loading ? 'Creating Poll...' : 'Create Poll'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: THEME TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  <span>Choose Theme Style</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'indigo', label: 'Indigo Modern', bg: 'bg-indigo-600' },
                    { id: 'slate', label: 'Slate Minimal', bg: 'bg-slate-800' },
                    { id: 'emerald', label: 'Emerald Clean', bg: 'bg-emerald-600' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t.id)}
                      className={`p-4 rounded-xl border-2 text-center cursor-pointer transition ${
                        selectedTheme === t.id ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${t.bg} mx-auto mb-2`} />
                      <span className="text-xs font-semibold text-slate-700">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveTab('poll')}
                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs cursor-pointer"
                  >
                    Save Theme
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-indigo-600" />
                  <span>Poll Settings</span>
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={allowMultiple}
                      onChange={(e) => setAllowMultiple(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Allow multiple choices</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Require single vote per voter (UUID + Cookie check)</span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveTab('poll')}
                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: SHARE TAB */}
            {activeTab === 'share' && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                  <h3 className="font-bold text-sm text-indigo-900 mb-1 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-indigo-600" />
                    <span>Your Unique Public Poll Link</span>
                  </h3>
                  <p className="text-xs text-indigo-700 mb-3">
                    Copy and share this URL to receive live responses in real time.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getShareURL()}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer flex-shrink-0 transition"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {createdPollId && (
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => window.location.href = `/poll/${createdPollId}`}
                      className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      View Live Poll Page
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
