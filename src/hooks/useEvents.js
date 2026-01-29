/**
 * Hook for fetching and managing event data
 *
 * Options:
 *   fetchAll: boolean - Fetch ALL markets (unfiltered) instead of env-var filtered
 *   refreshInterval: number - Auto-refresh interval in ms
 *   autoRefresh: boolean - Enable auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_REFRESH_INTERVAL = 60000; // 60 seconds

export function useEvents(options = {}) {
  const {
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    autoRefresh = true,
    fetchAll = false,
  } = options;

  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    try {
      const url = fetchAll ? '/api/events?all=true' : '/api/events';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.events || []);
      setMeta(data.meta || null);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchEvents, refreshInterval);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, refreshInterval, fetchEvents]);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchEvents();
  }, [fetchEvents]);

  const getEventById = useCallback((id) => {
    return events.find(e => e.id === id) || null;
  }, [events]);

  const getEventByTitle = useCallback((title) => {
    return events.find(e => e.title.toLowerCase().includes(title.toLowerCase())) || null;
  }, [events]);

  return {
    events,
    meta,
    loading,
    error,
    refresh,
    getEventById,
    getEventByTitle,
  };
}

export default useEvents;
