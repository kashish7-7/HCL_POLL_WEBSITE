import React, { useState } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Copy, Check, ExternalLink, LayoutDashboard, Sparkles, AlertCircle } from 'lucide-react';

export const CreatePoll = ({ onCreated, onNavigate }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPoll, setCreatedPoll] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!question.trim()) {
      setError('Poll question cannot be empty');
      setLoading(false);
      return;
    }

    const cleanOptions = options.map(o => o.trim()).filter(o => o.length > 0);
    if (cleanOptions.length < 2) {
      setError('Please provide at least 2 non-empty answer options');
      setLoading(false);
      return;
    }

    try {
      const res = await api.createPoll({
        question: question.trim(),
        options: cleanOptions,
      });

      setCreatedPoll(res.poll);
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const getPollURL = (id) => {
    return `${window.location.origin}/poll/${id}`;
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(getPollURL(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (createdPoll) {
    const pollURL = getPollURL(createdPoll.id);

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Poll Created Successfully!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Your real-time poll is live and ready to receive votes.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider text-left mb-1.5">
              Your Shareable Poll Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pollURL}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none"
              />
              <button
                onClick={() => copyLink(createdPoll.id)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onCreated(createdPoll.id)}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Poll</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create a New Poll
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill in your question and options to launch a real-time live poll
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Question <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What should we build next?"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              maxLength={300}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Answer Options (Minimum 2, Maximum 10) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">{options.length} / 10</span>
            </div>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 font-mono w-6">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    maxLength={150}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove Option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 font-semibold text-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
            >
              <span>{loading ? 'Creating Poll...' : 'Create Poll'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
