/**
 * Hook for editorial content with automatic rotation
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds
const DEFAULT_ROTATION_INTERVAL = 10000; // 10 seconds

export function useEditorial(options = {}) {
  const {
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    rotationInterval = DEFAULT_ROTATION_INTERVAL,
    autoRotate = true,
  } = options;

  const [themes, setThemes] = useState({});
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentTheme, setCurrentTheme] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const refreshIntervalRef = useRef(null);
  const rotationIntervalRef = useRef(null);

  const fetchEditorial = useCallback(async () => {
    try {
      const response = await fetch('/api/editorial');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setThemes(data.themes || {});
      setMeta(data.meta || null);
      setError(null);

      // Set initial theme if not set
      if (!currentTheme) {
        const firstTheme = Object.keys(data.themes || {}).find(
          key => data.themes[key]?.length > 0
        );
        if (firstTheme) {
          setCurrentTheme(firstTheme);
        }
      }
    } catch (err) {
      console.error('Failed to fetch editorial:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTheme]);

  // Get active themes (non-empty)
  const activeThemes = Object.keys(themes).filter(
    key => themes[key]?.length > 0
  );

  // Rotate to next theme
  const nextTheme = useCallback(() => {
    if (activeThemes.length === 0) return;

    const currentIdx = activeThemes.indexOf(currentTheme);
    const nextIdx = (currentIdx + 1) % activeThemes.length;

    setCurrentTheme(activeThemes[nextIdx]);
    setCurrentIndex(0);
  }, [activeThemes, currentTheme]);

  // Rotate to next market within theme
  const nextMarket = useCallback(() => {
    const themeMarkets = themes[currentTheme] || [];
    if (themeMarkets.length === 0) return;

    const nextIdx = (currentIndex + 1) % themeMarkets.length;

    // If we've cycled through all markets, move to next theme
    if (nextIdx === 0) {
      nextTheme();
    } else {
      setCurrentIndex(nextIdx);
    }
  }, [themes, currentTheme, currentIndex, nextTheme]);

  // Initial fetch
  useEffect(() => {
    fetchEditorial();
  }, []);

  // Auto refresh data
  useEffect(() => {
    refreshIntervalRef.current = setInterval(fetchEditorial, refreshInterval);
    return () => clearInterval(refreshIntervalRef.current);
  }, [fetchEditorial, refreshInterval]);

  // Auto rotation
  useEffect(() => {
    if (autoRotate && rotationInterval > 0) {
      rotationIntervalRef.current = setInterval(nextMarket, rotationInterval);
      return () => clearInterval(rotationIntervalRef.current);
    }
  }, [autoRotate, rotationInterval, nextMarket]);

  // Current market
  const currentMarket = themes[currentTheme]?.[currentIndex] || null;

  return {
    themes,
    meta,
    loading,
    error,
    currentTheme,
    currentIndex,
    currentMarket,
    activeThemes,
    setCurrentTheme,
    setCurrentIndex,
    nextTheme,
    nextMarket,
    refresh: fetchEditorial,
  };
}

export default useEditorial;
