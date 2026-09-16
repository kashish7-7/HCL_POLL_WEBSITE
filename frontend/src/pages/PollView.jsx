import React, { useEffect, useState, useRef } from 'react';
import { api, getWebSocketURL } from '../utils/api';
import { PollCard } from '../components/PollCard';
import { soundFx } from '../utils/sound';
import { Radio, ArrowLeft, Share2, Check, Wifi, WifiOff } from 'lucide-react';

export const PollView = ({ pollId, onBack }) => {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const wsRef = useRef(null);

  const fetchPollDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getPollById(pollId);
      setPoll(res.poll);
    } catch (err) {
      setError(err.message || 'Poll not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pollId) return;
    fetchPollDetails();

    // Setup WebSocket connection for live Redis updates
    const wsUrl = getWebSocketURL(pollId);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Gazette Live WebSocket Stream:', pollId);
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Live Vote Broadcast Received via Redis PubSub:', data);
        
        soundFx.playMechanicalClick();

        setPoll((prevPoll) => {
          if (!prevPoll) return prevPoll;
          
          const updatedOptions = prevPoll.options.map((opt) => {
            if (data.counts && data.counts[opt.id] !== undefined) {
              return { ...opt, votes: data.counts[opt.id] };
            }
            if (opt.id === data.option_id) {
              return { ...opt, votes: (opt.votes || 0) + 1 };
            }
            return opt;
          });

          return {
            ...prevPoll,
            options: updatedOptions,
            total_votes: data.total_votes || (prevPoll.total_votes + 1),
          };
        });
      } catch (err) {
        console.warn('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.warn('WebSocket connection error:', err);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [pollId]);

  const copyShareLink = () => {
    const url = `${window.location.origin}?poll=${pollId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    soundFx.playMechanicalClick();
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center font-serif text-[#4a423a]">
        <Radio className="w-8 h-8 animate-pulse mx-auto mb-2 text-amber-800" />
        Retrieving dispatch #{pollId} from the Gazette archives...
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center font-serif">
        <div className="p-6 bg-red-100 border-2 border-red-800 text-red-900 mb-4">
          {error || 'Poll not found'}
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#2c251e] bg-[#1f1b18] text-[#f6ebd6] font-serif uppercase font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Front Page
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {/* Realtime Connection Status Bar */}
      <div className="flex flex-wrap justify-between items-center bg-[#eedfc5] border-2 border-[#2c251e] p-3 mb-6 font-serif text-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-bold uppercase text-[#1f1b18] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dispatches
        </button>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold uppercase">
            {wsConnected ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-700 animate-pulse" />
                <span className="text-emerald-800">LIVE REDIS WEBSOCKET SYNCED</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-700" />
                <span className="text-amber-800">POLLING MODE</span>
              </>
            )}
          </span>

          <button
            onClick={copyShareLink}
            className="flex items-center gap-1 px-3 py-1 border border-[#2c251e] bg-[#f8f1e3] hover:bg-[#e4d4b8] font-bold uppercase cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied Share Link!' : 'Share Poll Link'}
          </button>
        </div>
      </div>

      {/* Main Poll Card */}
      <PollCard
        poll={poll}
        isDetailed={true}
        onPollUpdated={(updatedPayload) => {
          if (updatedPayload && updatedPayload.counts) {
            setPoll((prev) => ({
              ...prev,
              options: prev.options.map((opt) => ({
                ...opt,
                votes: updatedPayload.counts[opt.id] !== undefined ? updatedPayload.counts[opt.id] : opt.votes
              })),
              total_votes: updatedPayload.total_votes || prev.total_votes + 1
            }));
          }
        }}
      />
    </main>
  );
};
