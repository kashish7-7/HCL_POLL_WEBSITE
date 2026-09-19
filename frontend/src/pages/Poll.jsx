import React, { useState } from 'react';
import { useRealtimePoll } from '../hooks/useRealtimePoll';
import { Results } from '../components/Results';
import { getVoterId } from '../utils/voterId';
import { api } from '../services/api';
import { Radio as RadioIcon, Copy, Check, Share2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Poll = ({ pollId, onBack }) => {
  const { pollResults, loading, error, connected } = useRealtimePoll(pollId);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOption || submitting) return;

    setSubmitting(true);
    setVoteError('');

    try {
      const voterId = getVoterId();
      await api.votePoll(pollId, selectedOption, voterId);

      setHasVoted(true);
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      setVoteError(err.message || 'Failed to submit vote');
      if (err.message && err.message.toLowerCase().includes('already voted')) {
        setHasVoted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <RadioIcon className="w-8 h-8 text-indigo-600 animate-pulse mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading poll telemetry...</p>
      </div>
    );
  }

  if (error || !pollResults) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 mb-1">Poll Not Found</h3>
          <p className="text-sm text-slate-600 mb-6">{error || 'This poll link is invalid or may have been removed.'}</p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const showResults = hasVoted || !pollResults.is_active;

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className={`w-2 h-2 rounded-full bg-emerald-500 ${connected ? 'animate-pulse' : ''}`} />
              {connected ? 'LIVE WEBSOCKET SYNCED' : 'POLLING MODE'}
            </span>

            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm cursor-pointer transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share Poll'}</span>
            </button>
          </div>
        </div>

        {/* Main Poll Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              {!pollResults.is_active && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Closed Poll
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {pollResults.question}
            </h1>
          </div>

          {voteError && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{voteError}</span>
            </div>
          )}

          {/* Voting Interface */}
          {!showResults ? (
            <form onSubmit={handleVoteSubmit} className="space-y-4">
              <div className="space-y-3">
                {pollResults.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedOption === opt.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      value={opt.id}
                      checked={selectedOption === opt.id}
                      onChange={() => setSelectedOption(opt.id)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="ml-3 font-medium text-slate-900 text-base">
                      {opt.text}
                    </span>
                  </label>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedOption || submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-base transition shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{submitting ? 'Submitting Vote...' : 'Vote'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {hasVoted && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Your vote has been recorded! Live results update automatically below.</span>
                </div>
              )}

              <Results results={pollResults} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
