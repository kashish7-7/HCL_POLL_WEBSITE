import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LayoutDashboard, PlusCircle, ExternalLink, Copy, Check, Trash2, Power, AlertCircle } from 'lucide-react';

export const Dashboard = ({ onSelectPoll, onNavigate }) => {
  const [myPolls, setMyPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchMyPolls = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMyPolls();
      setMyPolls(res.polls || []);
    } catch (err) {
      setError(err.message || 'Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPolls();
  }, []);

  const handleClosePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to close this poll? Readers will no longer be able to cast votes.')) return;
    try {
      await api.closePoll(pollId);
      setMyPolls(myPolls.map(p => p.poll_id === pollId ? { ...p, is_active: false } : p));
    } catch (err) {
      alert('Failed to close poll: ' + err.message);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return;
    try {
      await api.deletePoll(pollId);
      setMyPolls(myPolls.filter(p => p.poll_id !== pollId));
    } catch (err) {
      alert('Failed to delete poll: ' + err.message);
    }
  };

  const copyLink = (pollId) => {
    const url = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pollId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />
            <span>My Polls Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your active polls, monitor live results, and share link dispatches.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Poll</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium">
          Loading your dashboard polls...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : myPolls.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-base text-slate-600 mb-6">
            You haven't created any polls yet.
          </p>
          <button
            onClick={() => onNavigate('create')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Poll</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myPolls.map((poll) => (
            <div 
              key={poll.poll_id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {poll.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Closed
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {poll.poll_id}
                  </span>
                </div>

                <h3 
                  onClick={() => onSelectPoll(poll.poll_id)}
                  className="font-bold text-xl text-slate-900 hover:text-indigo-600 cursor-pointer transition flex items-center gap-2"
                >
                  {poll.question}
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </h3>

                <p className="text-xs text-slate-500">
                  Total votes cast: <strong className="text-slate-800 font-semibold">{poll.total_votes || 0}</strong> • {poll.options?.length || 0} Options
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => onSelectPoll(poll.poll_id)}
                  className="px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View</span>
                </button>

                <button
                  onClick={() => copyLink(poll.poll_id)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === poll.poll_id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === poll.poll_id ? 'Copied' : 'Copy Link'}</span>
                </button>

                {poll.is_active && (
                  <button
                    onClick={() => handleClosePoll(poll.poll_id)}
                    className="px-3.5 py-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    title="Close Poll"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Close</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeletePoll(poll.poll_id)}
                  className="p-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                  title="Delete Poll"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
