import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { PollCard } from '../components/PollCard';
import { Newspaper, Flame, Radio, RefreshCw, PenTool } from 'lucide-react';

export const Home = ({ onSelectPoll, onNavigate }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const fetchPolls = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getPublicPolls();
      setPolls(res.polls || []);
    } catch (err) {
      setError('Failed to connect to the Gazette printing room. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const categories = ['ALL', 'Politics', 'Technology', 'Culture', 'Philosophy', 'General'];

  const filteredPolls = filterCategory === 'ALL' 
    ? polls 
    : polls.filter(p => (p.category || 'General').toLowerCase() === filterCategory.toLowerCase());

  return (
    <main className="max-w-5xl mx-auto px-4 py-4">
      {/* Front Page Headline Banner */}
      <div className="newspaper-border-double p-6 mb-8 bg-[#f8f1e3] text-center relative">
        <div className="text-xs font-serif uppercase tracking-widest text-[#8b5e34] font-bold mb-1">
          ★ TODAY'S SPECIAL EDITION ★
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-black text-[#1f1b18] uppercase tracking-tight">
          VOX POPULI: THE PEOPLE'S VOICE IN REAL-TIME
        </h2>
        <p className="font-serif italic text-sm text-[#4a423a] max-w-2xl mx-auto mt-2">
          Cast your vote below. All dispatches update automatically across connected telegraph receivers nationwide without requiring a page refresh.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs font-serif uppercase font-bold px-3 py-1 border transition cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#1f1b18] text-[#f6ebd6] border-[#1f1b18]'
                  : 'bg-[#eedfc5] text-[#1f1b18] border-[#2c251e] hover:bg-[#e4d4b8]'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={fetchPolls}
            className="flex items-center gap-1 text-xs font-serif uppercase font-bold px-3 py-1 border border-[#2c251e] bg-[#f8f1e3] hover:bg-[#e4d4b8] cursor-pointer text-[#1f1b18]"
            title="Refresh Gazette Dispatches"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Main Newspaper Layout: Left Column & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Broadside Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b-2 border-[#2c251e] pb-2 mb-4">
            <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#1f1b18] flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-800" />
              Latest Dispatches & Public Questions
            </h3>
            <span className="text-xs font-serif italic text-[#4a423a]">
              Showing {filteredPolls.length} Active Polls
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center font-serif italic text-lg text-[#4a423a] newspaper-container border-2 border-[#2c251e]">
              <Radio className="w-8 h-8 animate-pulse mx-auto mb-2 text-amber-800" />
              Receiving live dispatches from Redis telegraph engine...
            </div>
          ) : error ? (
            <div className="p-6 text-center font-serif text-red-900 bg-red-100 border-2 border-red-800">
              {error}
            </div>
          ) : filteredPolls.length === 0 ? (
            <div className="p-8 text-center newspaper-container border-2 border-[#2c251e]">
              <p className="font-serif text-base italic text-[#4a423a] mb-4">
                No active polls found in this category. Be the first editor to publish a question!
              </p>
              <button
                onClick={() => onNavigate('create')}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#2c251e] bg-[#1f1b18] text-[#f6ebd6] font-serif uppercase font-bold text-xs hover:bg-[#3d342c] cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                Publish First Poll
              </button>
            </div>
          ) : (
            filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onViewClick={() => onSelectPoll(poll.id)}
              />
            ))
          )}
        </div>

        {/* Right Sidebar Column */}
        <aside className="space-y-6">
          {/* Gazette Manifesto Box */}
          <div className="newspaper-container border-2 border-[#2c251e] p-5">
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-[#1f1b18] border-b-2 border-[#2c251e] pb-1 mb-3">
              ❖ THE GAZETTE MANIFESTO
            </h4>
            <p className="font-serif text-xs leading-relaxed text-[#3d342c] mb-3">
              Founded in 2026, <strong>The Gazette Polletin</strong> relies on an atomic Go + Redis broadcast architecture.
            </p>
            <ul className="font-serif text-xs space-y-1.5 list-disc list-inside text-[#4a423a]">
              <li><strong>Go (Gin)</strong>: High-throughput API server.</li>
              <li><strong>Redis</strong>: Atomic counters & real-time Pub/Sub.</li>
              <li><strong>MongoDB</strong>: Durable poll storage & audit log.</li>
              <li><strong>React</strong>: Old broadsheet newspaper interface.</li>
            </ul>
          </div>

          {/* Quick Create CTA */}
          <div className="woodcut-box p-5 text-center border-2 border-[#2c251e]">
            <h4 className="font-serif font-black text-base uppercase text-[#1f1b18] mb-1">
              HAVE A QUESTION FOR THE NATION?
            </h4>
            <p className="font-serif text-xs italic text-[#4a423a] mb-4">
              Publish a poll instantly and share the link to receive real-time votes.
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="w-full py-2 px-4 border-2 border-[#2c251e] bg-[#1f1b18] text-[#f6ebd6] font-serif uppercase font-bold text-xs hover:bg-[#3d342c] cursor-pointer transition"
            >
              Start New Poll
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
};
