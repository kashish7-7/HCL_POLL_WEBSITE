import React, { useState } from 'react';
import { RollingTicker } from './RollingTicker';
import { soundFx } from '../utils/sound';
import { api } from '../utils/api';
import { Share2, Check, Clock, User, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PollCard = ({ poll, onPollUpdated, isDetailed = false, onViewClick }) => {
  const [voting, setVoting] = useState(false);
  const [votedOption, setVotedOption] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const totalVotes = poll.total_votes || 0;

  const handleVote = async (optionId) => {
    if (voting) return;
    setVoting(true);
    setErrorMsg('');

    try {
      soundFx.playMechanicalClick();
      const res = await api.votePoll(poll.id, optionId);
      setVotedOption(optionId);
      soundFx.playFanfare();

      // Confetti effect for successful vote
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 }
      });

      if (onPollUpdated) {
        onPollUpdated(res.payload);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setVoting(false);
    }
  };

  const copyShareLink = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}?poll=${poll.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    soundFx.playMechanicalClick();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <article className="newspaper-container border-2 border-[#2c251e] p-5 mb-6 relative hover:shadow-lg transition-all duration-200">
      {/* Article Header */}
      <div className="flex flex-wrap justify-between items-start gap-2 border-b-2 border-[#2c251e] pb-3 mb-4">
        <div>
          <span className="text-[10px] font-serif uppercase tracking-widest bg-[#1f1b18] text-[#f6ebd6] px-2 py-0.5 font-bold mr-2">
            {poll.category || 'Gazette Special'}
          </span>
          <span className="text-xs font-serif italic text-[#4a423a]">
            Published {new Date(poll.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1 text-xs font-serif font-bold uppercase px-2 py-1 border border-[#2c251e] bg-[#eedfc5] hover:bg-[#e2d0b0] cursor-pointer transition text-[#1f1b18]"
            title="Copy Shareable Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Share Link'}
          </button>
        </div>
      </div>

      {/* Main Headline & Description */}
      <h2 
        onClick={onViewClick}
        className="font-serif text-xl sm:text-2xl font-black text-[#1f1b18] leading-tight mb-2 hover:underline cursor-pointer"
      >
        {poll.title}
      </h2>

      {poll.description && (
        <p className="font-serif text-sm text-[#3d342c] italic mb-4 leading-relaxed border-l-2 border-[#8b5e34] pl-3 py-0.5">
          "{poll.description}"
        </p>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-xs font-serif bg-red-100 border-l-4 border-red-800 text-red-900 p-2 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Options & Progress Bars */}
      <div className="space-y-3 mb-5">
        {poll.options.map((option) => {
          const votes = option.votes || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isSelected = votedOption === option.id;

          return (
            <div key={option.id} className="relative group">
              <button
                onClick={() => handleVote(option.id)}
                disabled={voting}
                className={`w-full text-left p-3 border-2 transition-all cursor-pointer relative overflow-hidden flex justify-between items-center ${
                  isSelected 
                    ? 'border-amber-900 bg-[#edd6b6] font-bold shadow' 
                    : 'border-[#2c251e] bg-[#fdf8ee] hover:bg-[#f5e8d2]'
                }`}
              >
                {/* Background Progress Fill */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-[#e4ccab] opacity-60 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />

                <span className="relative z-10 font-serif text-sm font-semibold text-[#1f1b18] flex items-center gap-2">
                  {isSelected && <span className="text-amber-900 font-bold">✓</span>}
                  {option.text}
                </span>

                <div className="relative z-10 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#4a423a]">
                    {percentage}%
                  </span>
                  <span className="font-mono text-xs bg-[#1f1b18] text-[#f6ebd6] px-1.5 py-0.5 rounded-sm">
                    {votes}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Card Footer */}
      <div className="flex flex-wrap justify-between items-center pt-3 border-t border-dashed border-[#594939] text-xs font-serif text-[#4a423a]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-amber-800" />
            By {poll.creator_name || 'Anonymous Editor'}
          </span>
          {poll.expires_at && (
            <span className="flex items-center gap-1 text-amber-900">
              <Clock className="w-3.5 h-3.5" />
              Expires: {new Date(poll.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div className="mt-2 sm:mt-0 flex items-center gap-3">
          <RollingTicker value={totalVotes} label="TOTAL VOTES" />
        </div>
      </div>
    </article>
  );
};
