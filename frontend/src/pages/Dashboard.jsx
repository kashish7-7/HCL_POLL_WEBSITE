import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { soundFx } from '../utils/sound';
import { LayoutDashboard, PenTool, Trash2, Share2, Check, Radio, ExternalLink } from 'lucide-react';

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
      setError(err.message || 'Failed to fetch your published polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPolls();
  }, []);

  const handleDelete = async (pollId) => {
    if (!window.confirm('Are you sure you wish to retract and delete this poll dispatch?')) return;

    try {
      soundFx.playMechanicalClick();
      await api.deletePoll(pollId);
      setMyPolls(myPolls.filter(p => p.id !== pollId));
    } catch (err) {
      alert('Failed to delete poll: ' + err.message);
    }
  };

  const copyShareLink = (pollId) => {
    const url = `${window.location.origin}?poll=${pollId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pollId);
    soundFx.playMechanicalClick();
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="newspaper-container border-2 border-[#2c251e] p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center border-b-4 border-double border-[#2c251e] pb-4 mb-6">
          <div>
            <span className="text-xs font-serif uppercase tracking-widest text-[#8b5e34] font-bold">
              ★ EDITOR'S DASHBOARD ★
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase text-[#1f1b18]">
              MY PUBLISHED POLL DISPATCHES
            </h2>
          </div>

          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#2c251e] bg-[#1f1b18] text-[#f6ebd6] font-serif uppercase font-bold text-xs hover:bg-[#3d342c] cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-amber-500" />
            Publish New Poll
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center font-serif italic text-[#4a423a]">
            <Radio className="w-8 h-8 animate-pulse mx-auto mb-2 text-amber-800" />
            Opening Editor's archive...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border-2 border-red-800 text-red-900 font-serif text-xs">
            {error}
          </div>
        ) : myPolls.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-[#594939] bg-[#f8f1e3]">
            <p className="font-serif text-base italic text-[#4a423a] mb-4">
              You have not published any polls yet.
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#2c251e] bg-[#1f1b18] text-[#f6ebd6] font-serif uppercase font-bold text-xs"
            >
              <PenTool className="w-4 h-4 text-amber-500" />
              Publish Your First Dispatch
            </button>
          </div>
        ) : (
          <div className="space-y-4 font-serif">
            {myPolls.map((poll) => (
              <div 
                key={poll.id} 
                className="border-2 border-[#2c251e] p-4 bg-[#fdf8ee] hover:bg-[#f8f1e3] transition flex flex-wrap justify-between items-center gap-4"
              >
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold bg-[#1f1b18] text-[#f6ebd6] px-1.5 py-0.5">
                      {poll.category || 'General'}
                    </span>
                    <span className="text-xs italic text-[#4a423a]">
                      Published {new Date(poll.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 
                    onClick={() => onSelectPoll(poll.id)}
                    className="font-bold text-lg text-[#1f1b18] hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    {poll.title}
                    <ExternalLink className="w-3.5 h-3.5 text-amber-800" />
                  </h3>
                  <p className="text-xs text-[#4a423a] mt-1">
                    {poll.options?.length || 0} Options • Total Votes Recorded: <strong>{poll.total_votes || 0}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyShareLink(poll.id)}
                    className="flex items-center gap-1 text-xs font-bold uppercase px-3 py-1.5 border border-[#2c251e] bg-[#eedfc5] hover:bg-[#e4d4b8] cursor-pointer"
                  >
                    {copiedId === poll.id ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
                    {copiedId === poll.id ? 'Copied Link' : 'Copy Link'}
                  </button>

                  <button
                    onClick={() => handleDelete(poll.id)}
                    className="p-1.5 border border-red-800 text-red-900 bg-red-100 hover:bg-red-200 cursor-pointer"
                    title="Retract / Delete Poll"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
