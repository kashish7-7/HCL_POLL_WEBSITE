import { useState, useEffect, useRef, useCallback } from 'react';
import { api, getWebSocketURL } from '../services/api';

export function useRealtimePoll(pollId) {
  const [pollResults, setPollResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  const fetchInitialResults = useCallback(async () => {
    if (!pollId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getPollResults(pollId);
      setPollResults(res.results);
    } catch (err) {
      setError(err.message || 'Failed to load poll results');
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    fetchInitialResults();

    if (!pollId) return;

    const wsUrl = getWebSocketURL(pollId);
    let ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`Connected to WebSocket live stream for poll: ${pollId}`);
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Realtime vote event received via Redis Pub/Sub:", data);

        setPollResults((prevResults) => {
          if (!prevResults) return prevResults;

          const newCounts = data.counts || {};
          const totalVotes = data.total_votes || prevResults.total_votes;

          const updatedOptions = prevResults.options.map((opt) => {
            const votes = newCounts[opt.id] !== undefined ? newCounts[opt.id] : opt.votes;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            return {
              ...opt,
              votes,
              percentage: Math.round(percentage * 10) / 10,
            };
          });

          return {
            ...prevResults,
            counts: newCounts,
            total_votes: totalVotes,
            options: updatedOptions,
          };
        });
      } catch (e) {
        console.warn("Failed to parse WebSocket event:", e);
      }
    };

    ws.onerror = (err) => {
      console.warn("WebSocket error:", err);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [pollId, fetchInitialResults]);

  return {
    pollResults,
    loading,
    error,
    connected,
    refresh: fetchInitialResults,
  };
}
