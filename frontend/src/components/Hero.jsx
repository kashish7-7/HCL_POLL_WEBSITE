import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Image as ImageIcon, Plus, Trash2, Check, Copy, Palette, Settings as SettingsIcon, Share2, Sparkles, AlertCircle } from 'lucide-react';

export const Hero = ({ onNavigate, onPollCreated }) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('poll'); // 'poll' | 'theme' | 'settings' | 'share'
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [selectedTheme, setSelectedTheme] = useState('blue');
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
      setError('Please type your question above');
      setLoading(false);
      return;
    }

    const cleanOpts = options.map(o => o.trim()).filter(o => o.length > 0);
    if (cleanOpts.length < 2) {
      setError('Please provide at least 2 answer options');
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
    return createdPollId ? `${window.location.origin}/poll/${createdPollId}` : `${window.location.origin}/poll/demo-id`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareURL());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="bg-gradient-to-b from-[#1644b5] via-[#123ca7] to-[#0f308a] text-white py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Banner Headlines matching Image 1 */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2 text-white font-sans">
          Use the #1 Rated Poll Maker
        </h1>
        <h2 className="text-2xl sm:text-4xl font-normal text-blue-100 mb-10 font-sans">
          Create a Live Poll in Seconds
        </h2>

        {/* Center Interactive Poll Maker Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden text-slate-800 text-left border border-blue-200/40">
          {/* Top Tabs Bar */}
          <div className="grid grid-cols-4 bg-[#f2f2f2] border-b border-slate-300 text-center font-medium text-slate-600 text-sm sm:text-base">
            <button
              onClick={() => setActiveTab('poll')}
              className={`py-3.5 sm:py-4 transition border-b-2 cursor-pointer font-semibold ${
                activeTab === 'poll'
                  ? 'bg-white text-blue-600 border-blue-600'
                  : 'hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              Poll
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`py-3.5 sm:py-4 transition border-b-2 cursor-pointer font-semibold ${
                activeTab === 'theme'
                  ? 'bg-white text-blue-600 border-blue-600'
                  : 'hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              Theme
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3.5 sm:py-4 transition border-b-2 cursor-pointer font-semibold ${
                activeTab === 'settings'
                  ? 'bg-white text-blue-600 border-blue-600'
                  : 'hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`py-3.5 sm:py-4 transition border-b-2 cursor-pointer font-semibold ${
                activeTab === 'share'
                  ? 'bg-white text-blue-600 border-blue-600'
                  : 'hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              Share
            </button>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: POLL TAB (Matching Image 1) */}
            {activeTab === 'poll' && (
              <form onSubmit={handleCreatePoll} className="space-y-4">
                {/* Question Input Box */}
                <div className="relative">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question here"
                    rows={2}
                    className="w-full p-4 pr-10 border border-slate-300 rounded-md text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none font-sans"
                    maxLength={300}
                    required
                  />
                  <div className="absolute top-4 right-3 text-slate-400 cursor-pointer hover:text-slate-600" title="Image option">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </div>

                {/* Option Input Rows */}
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {options.map((opt, idx) => (
                    <div key={idx} className="relative flex items-center">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={idx === 0 ? "Type your answers here" : `Answer option ${idx + 1}`}
                        className="w-full p-3.5 pr-12 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-sans"
                      />
                      <div className="absolute right-3 flex items-center gap-1 text-slate-400">
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionRow(idx)}
                            className="p-1 hover:text-rose-600 cursor-pointer"
                            title="Remove answer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <ImageIcon className="w-4 h-4 hover:text-slate-600 cursor-pointer" title="Add image to option" />
                      </div>
                    </div>
                  ))}
                </div>

                {options.length < 10 && (
                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer pt-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Answer Option</span>
                  </button>
                )}

                {/* Coral Red "Create Poll" CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-md bg-[#e4425e] hover:bg-[#d43550] text-white font-bold text-lg tracking-wide transition shadow-md cursor-pointer font-sans"
                  >
                    {loading ? 'Creating Poll...' : 'Create Poll'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: THEME TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <span>Choose Poll Visual Theme</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'blue', label: 'Classic Blue', bg: 'bg-blue-600' },
                    { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-600' },
                    { id: 'purple', label: 'Royal Purple', bg: 'bg-purple-600' },
                    { id: 'dark', label: 'Midnight Dark', bg: 'bg-slate-900' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t.id)}
                      className={`p-4 rounded-lg border-2 text-center cursor-pointer transition ${
                        selectedTheme === t.id ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${t.bg} mx-auto mb-2`} />
                      <span className="text-xs font-semibold text-slate-700">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setActiveTab('poll')}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-md text-sm cursor-pointer"
                  >
                    Apply Theme
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-blue-600" />
                  <span>Poll Rules & Configuration</span>
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={allowMultiple}
                      onChange={(e) => setAllowMultiple(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">Allow multiple choice votes</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">Enforce browser deduplication check</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setActiveTab('poll')}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-md text-sm cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: SHARE TAB */}
            {activeTab === 'share' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-base text-blue-900 mb-1 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-blue-600" />
                    <span>Your Unique Public Poll Link</span>
                  </h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Copy and share this URL with your audience to receive real-time votes instantly.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getShareURL()}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-mono text-slate-800"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {createdPollId && (
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => window.location.href = `/poll/${createdPollId}`}
                      className="px-6 py-3 bg-[#e4425e] text-white font-bold rounded-md text-sm cursor-pointer shadow"
                    >
                      Open Live Poll Page
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
