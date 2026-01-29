/**
 * Portrait Broadcast page - OBS capture target (1080x1920)
 * Simplified layout: no sidebar, no secondary markets
 */

import { useState, useEffect, useMemo } from 'react';
import { BroadcastLayoutPortrait } from '../layouts/BroadcastLayoutPortrait.jsx';
import { ThemeProvider } from '../themes/index.jsx';
import { useMarketData, useEvents, useEditorial, useBroadcastSync } from '../hooks/index.js';

export function BroadcastPortrait() {
  const [config, setConfig] = useState(null);
  const { markets } = useMarketData({ refreshInterval: 60000 });
  const { events, getEventById } = useEvents({ refreshInterval: 60000 });
  const { currentMarket, themes } = useEditorial({ rotationInterval: 10000 });
  const { state } = useBroadcastSync({ isController: false });

  // Rotation state for zones (simplified - no sidebar)
  const [rotationIndex, setRotationIndex] = useState({
    featured: 0,
    lowerThird: 0,
  });

  // Handle rotation timer for featured zone
  useEffect(() => {
    const mainContent = state.zones?.main?.content;

    // Featured rotation - every 20 seconds
    if (mainContent?.rotation?.zone === 'featured' && mainContent?.rotation?.events?.length > 1) {
      const timer = setInterval(() => {
        setRotationIndex(prev => ({
          ...prev,
          featured: (prev.featured + 1) % mainContent.rotation.events.length,
        }));
      }, mainContent.rotation.interval || 20000);

      return () => clearInterval(timer);
    }
  }, [state.zones?.main?.content]);

  // Fetch config on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        setConfig({
          ...data,
          voteUrl: `${window.location.origin}/vote`,
          logoUrl: data.deploymentId
            ? `/assets/${data.deploymentId}/logo.png`
            : null,
        });
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    }
    fetchConfig();
  }, []);

  // Get playlist events for trending markets default
  const playlistEvents = state.zones?.playlist?.content?.events || [];

  // Build trending markets from playlist events OR fall back to all events
  const trendingMarkets = useMemo(() => {
    const sourceEvents = playlistEvents.length > 0 ? playlistEvents : events;
    if (sourceEvents.length === 0) return null;

    const allOutcomes = [];
    for (const event of sourceEvents) {
      if (event.outcomes) {
        for (const outcome of event.outcomes) {
          allOutcomes.push({
            ...outcome,
            eventTitle: event.title,
            eventId: event.id,
          });
        }
      }
    }

    allOutcomes.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    return allOutcomes.slice(0, 10);
  }, [playlistEvents, events]);

  // Pre-fetch price history for trending markets (4-hour refresh)
  const [priceHistoryCache, setPriceHistoryCache] = useState({});
  const [lastPriceFetch, setLastPriceFetch] = useState(0);
  const PRICE_CACHE_TTL = 4 * 60 * 60 * 1000;

  useEffect(() => {
    if (!trendingMarkets || trendingMarkets.length === 0) return;

    const now = Date.now();
    const cacheAge = now - lastPriceFetch;

    if (Object.keys(priceHistoryCache).length > 0 && cacheAge < PRICE_CACHE_TTL) {
      return;
    }

    const fetchHistories = async () => {
      const newCache = {};

      for (const market of trendingMarkets) {
        const tokenId = market.tokenId;
        if (!tokenId) continue;

        try {
          await new Promise(r => setTimeout(r, 200));
          const response = await fetch(`/api/prices?tokenId=${tokenId}&interval=1w`);
          if (response.ok) {
            const data = await response.json();
            newCache[tokenId] = data.history || [];
          }
        } catch (error) {
          console.error('Failed to prefetch price history:', error);
        }
      }

      setPriceHistoryCache(newCache);
      setLastPriceFetch(Date.now());
    };

    fetchHistories();

    const intervalId = setInterval(fetchHistories, PRICE_CACHE_TTL);
    return () => clearInterval(intervalId);
  }, [trendingMarkets?.map(m => m.tokenId).join(',')]);

  // Build editorial content list for lower third rotation
  const editorialList = useMemo(() => {
    if (!themes) return [];

    const themeOrder = [
      'bigMovers',
      'debateFuel',
      'longshotWatch',
      'volumeSurge',
      'fadingFast',
      'sentimentGaps',
      'crowdFavorites',
      'freshMarkets',
      'mostEngaged',
    ];

    const list = [];
    const seen = new Set();

    for (const themeName of themeOrder) {
      const themeMarkets = themes[themeName] || [];
      for (const market of themeMarkets) {
        const id = market.id || market.slug;
        if (!seen.has(id)) {
          seen.add(id);
          list.push({
            ...market,
            theme: themeName,
          });
        }
        if (list.length >= 20) break;
      }
      if (list.length >= 20) break;
    }

    return list;
  }, [themes]);

  // Lower third editorial rotation
  useEffect(() => {
    if (editorialList.length === 0) return;

    const lowerThirdState = state.zones?.lowerThird?.state;
    if (lowerThirdState === 'off') return;

    const timer = setInterval(() => {
      setRotationIndex(prev => ({
        ...prev,
        lowerThird: (prev.lowerThird + 1) % editorialList.length,
      }));
    }, 12000);

    return () => clearInterval(timer);
  }, [editorialList.length, state.zones?.lowerThird?.state]);

  // Resolve zone data - simplified for portrait (no sidebar, no secondary)
  const zoneData = useMemo(() => {
    const mainContent = state.zones?.main?.content;
    const lowerThirdContent = state.zones?.lowerThird?.content;
    const tickerContent = state.zones?.ticker?.content;

    // Resolve main zone data (featured only, no secondary)
    let mainData = null;
    if (mainContent?.type === 'featuredLayout') {
      let featured = mainContent.featured;

      // Handle featured rotation
      if (mainContent.rotation?.zone === 'featured' && mainContent.rotation?.events?.length > 1) {
        const idx = rotationIndex.featured % mainContent.rotation.events.length;
        featured = mainContent.rotation.events[idx];
      }

      // For portrait: only featured + trending, no secondary
      if (!featured && trendingMarkets?.length > 0) {
        mainData = {
          featured: null,
          trending: trendingMarkets,
          priceHistoryCache,
        };
      } else if (!featured && events.length > 0) {
        mainData = {
          featured: events[0],
        };
      } else {
        mainData = { featured };
      }
    } else if (mainContent?.type === 'eventGroup' && mainContent?.event) {
      mainData = mainContent.event;
    } else if (mainContent?.type === 'eventGroup' && mainContent?.eventId) {
      mainData = getEventById(mainContent.eventId) || events[0];
    } else if (mainContent?.type === 'editorialCard') {
      mainData = currentMarket || markets[0];
    } else if (mainContent?.type === 'marketList') {
      mainData = markets.slice(0, 6);
    } else {
      // Default: show featured layout with first event
      mainData = {
        featured: events[0] || null,
        trending: trendingMarkets,
        priceHistoryCache,
      };
    }

    // Resolve lower third zone data
    let lowerThirdData = null;
    if (lowerThirdContent?.type === 'eventGroup' && lowerThirdContent?.event) {
      lowerThirdData = lowerThirdContent.event;
    } else if (editorialList.length > 0) {
      const idx = rotationIndex.lowerThird % editorialList.length;
      lowerThirdData = editorialList[idx];
    } else if (themes?.bigMovers?.[0]) {
      lowerThirdData = themes.bigMovers[0];
    }

    // Resolve ticker zone data
    let tickerData = null;
    if (tickerContent?.type === 'eventGroup' && tickerContent?.events) {
      tickerData = { type: 'events', events: tickerContent.events };
    } else if (tickerContent?.type === 'eventGroup' && tickerContent?.event) {
      tickerData = { type: 'event', event: tickerContent.event };
    } else {
      tickerData = { type: 'events', events: events.slice(0, 5) };
    }

    // Resolve secondary markets for portrait (2 cards, rotating)
    let secondaryData = [];
    if (mainContent?.secondary?.length > 0) {
      secondaryData = mainContent.secondary;
    } else if (mainContent?.rotation?.zone === 'secondary' && mainContent?.rotation?.events?.length > 0) {
      secondaryData = mainContent.rotation.events;
    } else {
      // Default: use events after the first one
      secondaryData = events.slice(1, 10);
    }

    return {
      main: mainData,
      secondary: secondaryData,
      lowerThird: lowerThirdData,
      ticker: tickerData,
    };
  }, [state.zones, markets, events, currentMarket, themes, getEventById, rotationIndex, trendingMarkets, priceHistoryCache, editorialList]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <ThemeProvider defaultTheme={state.theme || config?.defaultTheme}>
        <BroadcastLayoutPortrait
          zones={state.zones}
          data={zoneData}
          config={config}
        />
      </ThemeProvider>
    </div>
  );
}

export default BroadcastPortrait;
