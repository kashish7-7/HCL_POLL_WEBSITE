import { useState, useEffect, useRef, useCallback } from 'react';
import { api, getWebSocketURL } from '../services/api';

export function useRealtimePoll(pollId, isCreatorView = false) {
  const [pollResults, setPollResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const fetchInitialResults = useCallback(async () => {
    if (!pollId) return;
    setLoading(true);
    setError('');
    try {
      const res = isCreatorView
        ? await api.getOwnerPollResults(pollId)
        : await api.getPollResults(pollId);
      setPollResults(res.results);
      console.log(`[REALTIME][CLIENT] Initial REST results loaded for poll ${pollId}:`, res.results);
    } catch (err) {
      setError(err.message || 'Failed to load poll results');
      console.warn(`[REALTIME][CLIENT] Failed to load REST results for poll ${pollId}:`, err);
    } finally {
      setLoading(false);
    }
  }, [pollId, isCreatorView]);

  useEffect(() => {
    fetchInitialResults();

    if (!pollId) return;

    let isMounted = true;

    const connectWebSocket = () => {
      if (!isMounted) return;

      const wsUrl = getWebSocketURL(pollId);
      console.log(`[REALTIME][CLIENT] connecting url=${wsUrl}`);

      let ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        console.log(`[REALTIME][CLIENT] connected to poll=${pollId}`);
        setConnected(true);
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        console.log(`[REALTIME][CLIENT] message received poll=${pollId}`, event.data);

        try {
          const data = JSON.parse(event.data);

          setPollResults((prevResults) => {
            if (!prevResults) {
              // If initial REST fetch hasn't completed yet, trigger immediate re-fetch
              console.log(`[REALTIME][CLIENT] prevResults is null, triggering REST refetch for poll=${pollId}`);
              fetchInitialResults();
              return null;
            }

            const newCounts = data.counts || {};
            const totalVotes = data.total_votes !== undefined ? data.total_votes : prevResults.total_votes;

            const updatedOptions = prevResults.options.map((opt) => {
              const votes = newCounts[opt.id] !== undefined ? newCounts[opt.id] : opt.votes;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              return {
                ...opt,
                votes,
                percentage: Math.round(percentage * 10) / 10,
              };
            });

            console.log(`[REALTIME][CLIENT] updating results poll=${pollId} total_votes=${totalVotes}`);
            return {
              ...prevResults,
              counts: newCounts,
              total_votes: totalVotes,
              options: updatedOptions,
            };
          });
        } catch (e) {
          console.warn("[REALTIME][CLIENT] Failed to parse WebSocket JSON event:", e);
        }
      };

      ws.onerror = (err) => {
        if (!isMounted) return;
        console.warn(`[REALTIME][CLIENT] websocket error poll=${pollId}`, err);
        setConnected(false);
      };

      ws.onclose = () => {
        if (!isMounted) return;
        console.log(`[REALTIME][CLIENT] disconnected from poll=${pollId}`);
        setConnected(false);

        // Auto reconnect after 2.5s backoff
        reconnectTimerRef.current = setTimeout(() => {
          if (isMounted) {
            console.log(`[REALTIME][CLIENT] attempting reconnect poll=${pollId}`);
            fetchInitialResults();
            connectWebSocket();
          }
        }, 2500);
      };
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
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
