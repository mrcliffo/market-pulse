/**
 * Hook for fetching and managing market data
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_REFRESH_INTERVAL = 60000; // 60 seconds

export function useMarketData(options = {}) {
  const {
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    autoRefresh = true,
  } = options;

  const [markets, setMarkets] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const response = await fetch('/api/markets');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setMarkets(data.markets || []);
      setMeta(data.meta || null);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch markets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchMarkets, refreshInterval);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, refreshInterval, fetchMarkets]);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchMarkets();
  }, [fetchMarkets]);

  const getMarketBySlug = useCallback((slug) => {
    return markets.find(m => m.slug === slug) || null;
  }, [markets]);

  return {
    markets,
    meta,
    loading,
    error,
    refresh,
    getMarketBySlug,
  };
}

export default useMarketData;
