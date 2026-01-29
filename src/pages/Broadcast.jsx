/**
 * Broadcast page - OBS capture target
 */

import { useState, useEffect, useMemo } from 'react';
import { BroadcastLayout } from '../layouts/BroadcastLayout.jsx';
import { ThemeProvider } from '../themes/index.jsx';
import { useMarketData, useEvents, useEditorial, useBroadcastSync } from '../hooks/index.js';

export function Broadcast() {
  const [config, setConfig] = useState(null);
  const { markets } = useMarketData({ refreshInterval: 60000 });
  const { events, getEventById } = useEvents({ refreshInterval: 60000 });
  const { currentMarket, themes } = useEditorial({ rotationInterval: 10000 });
  const { state } = useBroadcastSync({ isController: false });

  // Rotation state for zones with multiple events
  const [rotationIndex, setRotationIndex] = useState({
    featured: 0,
    secondary: 0,
    sidebar: 0,
    lowerThird: 0,
  });

  // Handle rotation timer for main/sidebar zones
  useEffect(() => {
    const mainContent = state.zones?.main?.content;
    const sidebarContent = state.zones?.sidebar?.content;

    const rotations = [];

    // Featured rotation - every 20 seconds
    if (mainContent?.rotation?.zone === 'featured' && mainContent?.rotation?.events?.length > 1) {
      rotations.push({
        zone: 'featured',
        events: mainContent.rotation.events,
        interval: mainContent.rotation.interval || 20000,
      });
    }

    // Secondary rotation - every 20 seconds
    if (mainContent?.rotation?.zone === 'secondary' && mainContent?.rotation?.events?.length > 3) {
      rotations.push({
        zone: 'secondary',
        events: mainContent.rotation.events,
        interval: mainContent.rotation.interval || 20000,
      });
    }

    // Sidebar rotation
    if (sidebarContent?.rotation?.events?.length > 1) {
      rotations.push({
        zone: 'sidebar',
        events: sidebarContent.rotation.events,
        interval: sidebarContent.rotation.interval || 15000,
      });
    }

    if (rotations.length === 0) return;

    const timers = rotations.map(({ zone, events, interval }) => {
      return setInterval(() => {
        setRotationIndex(prev => ({
          ...prev,
          [zone]: (prev[zone] + 1) % events.length,
        }));
      }, interval);
    });

    return () => timers.forEach(t => clearInterval(t));
  }, [state.zones?.main?.content, state.zones?.sidebar?.content]);

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
    // Use playlist if available, otherwise use all events
    const sourceEvents = playlistEvents.length > 0 ? playlistEvents : events;
    if (sourceEvents.length === 0) return null;

    // Aggregate all outcomes from events
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

    // Sort by volume (descending) to get "trending"
    allOutcomes.sort((a, b) => (b.volume || 0) - (a.volume || 0));

    // Return top 10
    return allOutcomes.slice(0, 10);
  }, [playlistEvents, events]);

  // Pre-fetch price history for all trending markets (4-hour refresh)
  const [priceHistoryCache, setPriceHistoryCache] = useState({});
  const [lastPriceFetch, setLastPriceFetch] = useState(0);
  const PRICE_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours - sparklines don't need frequent updates

  useEffect(() => {
    if (!trendingMarkets || trendingMarkets.length === 0) return;

    const now = Date.now();
    const cacheAge = now - lastPriceFetch;

    // Only fetch if cache is empty or older than 1 hour
    if (Object.keys(priceHistoryCache).length > 0 && cacheAge < PRICE_CACHE_TTL) {
      return;
    }

    // Fetch price history for each trending market with throttling
    const fetchHistories = async () => {
      const newCache = {};

      for (const market of trendingMarkets) {
        const tokenId = market.tokenId;
        if (!tokenId) continue;

        try {
          // Add small delay between requests to avoid rate limiting
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

    // Set up hourly refresh interval
    const intervalId = setInterval(fetchHistories, PRICE_CACHE_TTL);
    return () => clearInterval(intervalId);
  }, [trendingMarkets?.map(m => m.tokenId).join(',')]);

  // Build big movers from PLAYLIST events or fall back to all events
  const bigMovers = useMemo(() => {
    // Use playlist events if available, otherwise fall back to all events
    const sourceEvents = playlistEvents.length > 0 ? playlistEvents : events;
    if (sourceEvents.length === 0) return [];

    // Aggregate all outcomes from events
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

    // Sort by absolute price change (descending) to get "big movers"
    allOutcomes.sort((a, b) => Math.abs(b.change24h || 0) - Math.abs(a.change24h || 0));

    // Return top 10 with significant movement
    return allOutcomes
      .filter(o => Math.abs(o.change24h || 0) > 0.001)
      .slice(0, 10);
  }, [playlistEvents, events]);

  // Build editorial content list for lower third rotation
  const editorialList = useMemo(() => {
    if (!themes) return [];

    // Priority order for themes - most interesting first
    const themeOrder = [
      'bigMovers',      // Markets with big price swings
      'debateFuel',     // 50/50 markets - controversial
      'longshotWatch',  // Underdogs gaining momentum
      'volumeSurge',    // High trading activity
      'fadingFast',     // Markets losing value
      'sentimentGaps',  // Crowd vs market disagreement
      'crowdFavorites', // High conviction picks
      'freshMarkets',   // New markets
      'mostEngaged',    // Most voted on
    ];

    const list = [];
    const seen = new Set();

    // Collect markets from each theme, avoiding duplicates
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
        // Limit total items for performance
        if (list.length >= 20) break;
      }
      if (list.length >= 20) break;
    }

    return list;
  }, [themes]);

  // Lower third editorial rotation - cycles through editorial list
  useEffect(() => {
    if (editorialList.length === 0) return;

    // Only rotate if lower third is visible
    const lowerThirdState = state.zones?.lowerThird?.state;
    if (lowerThirdState === 'off') return;

    const timer = setInterval(() => {
      setRotationIndex(prev => ({
        ...prev,
        lowerThird: (prev.lowerThird + 1) % editorialList.length,
      }));
    }, 12000); // 12 seconds per editorial card

    return () => clearInterval(timer);
  }, [editorialList.length, state.zones?.lowerThird?.state]);

  // Resolve zone data based on content assignments
  const zoneData = useMemo(() => {
    const mainContent = state.zones?.main?.content;
    const sidebarContent = state.zones?.sidebar?.content;
    const lowerThirdContent = state.zones?.lowerThird?.content;
    const tickerContent = state.zones?.ticker?.content;

    // Resolve main zone data
    let mainData = null;
    if (mainContent?.type === 'featuredLayout') {
      // Check for rotation
      let featured = mainContent.featured;
      let secondary = mainContent.secondary || [];

      // Handle featured rotation
      if (mainContent.rotation?.zone === 'featured' && mainContent.rotation?.events?.length > 1) {
        const idx = rotationIndex.featured % mainContent.rotation.events.length;
        featured = mainContent.rotation.events[idx];
      }

      // Handle secondary rotation (cycle through in groups of 3)
      if (mainContent.rotation?.zone === 'secondary' && mainContent.rotation?.events?.length > 3) {
        const startIdx = (rotationIndex.secondary * 3) % mainContent.rotation.events.length;
        secondary = [];
        for (let i = 0; i < 3; i++) {
          const idx = (startIdx + i) % mainContent.rotation.events.length;
          secondary.push(mainContent.rotation.events[idx]);
        }
      }

      // Ensure secondary has data - fall back to events if empty
      // Pass more events so SecondaryMarkets can rotate through them
      const resolvedSecondary = secondary.length > 0 ? secondary : events.slice(1, 10);

      // If no featured event, use trending markets from playlist OR fall back to events
      if (!featured && trendingMarkets?.length > 0) {
        mainData = {
          featured: null,
          secondary: resolvedSecondary,
          trending: trendingMarkets,
          priceHistoryCache, // Pass pre-fetched price history
        };
      } else if (!featured && events.length > 0) {
        // Fallback: use first events when no playlist configured (OBS standalone mode)
        mainData = {
          featured: events[0],
          secondary: resolvedSecondary,
        };
      } else {
        mainData = { featured, secondary: resolvedSecondary };
      }
    } else if (mainContent?.type === 'eventGroup' && mainContent?.event) {
      // Legacy: Event was passed directly from control panel
      mainData = mainContent.event;
    } else if (mainContent?.type === 'eventGroup' && mainContent?.eventId) {
      // Legacy: Look up event by ID
      mainData = getEventById(mainContent.eventId) || events[0];
    } else if (mainContent?.type === 'editorialCard') {
      mainData = currentMarket || markets[0];
    } else if (mainContent?.type === 'marketList') {
      mainData = markets.slice(0, 6);
    } else {
      // Default: show featured layout with first events
      mainData = {
        featured: events[0] || null,
        secondary: events.slice(1, 4),
      };
    }

    // Resolve sidebar zone data
    // Default: null (triggers BigMovers in Sidebar component)
    let sidebarData = null;
    if (sidebarContent?.rotation?.events?.length > 1) {
      // Rotation mode - pick current event from rotation
      const idx = rotationIndex.sidebar % sidebarContent.rotation.events.length;
      sidebarData = sidebarContent.rotation.events[idx];
    } else if (sidebarContent?.type === 'eventGroup' && sidebarContent?.event) {
      sidebarData = sidebarContent.event;
    } else if (sidebarContent?.type === 'eventGroup' && sidebarContent?.eventId) {
      sidebarData = getEventById(sidebarContent.eventId);
    } else if (sidebarContent?.type === 'marketList') {
      sidebarData = markets.slice(0, 5);
    }
    // else: sidebarData stays null, Sidebar shows BigMovers by default

    // Resolve lower third zone data - cycles through editorial list
    let lowerThirdData = null;
    if (lowerThirdContent?.type === 'eventGroup' && lowerThirdContent?.event) {
      // Explicit event assignment from control panel
      lowerThirdData = lowerThirdContent.event;
    } else if (editorialList.length > 0) {
      // Default: cycle through editorial list
      const idx = rotationIndex.lowerThird % editorialList.length;
      lowerThirdData = editorialList[idx];
    } else if (themes?.bigMovers?.[0]) {
      // Fallback to first big mover
      lowerThirdData = themes.bigMovers[0];
    }

    // Resolve ticker zone data - supports single event or multiple events
    let tickerData = null;
    if (tickerContent?.type === 'eventGroup' && tickerContent?.events) {
      // Multiple events assigned from playlist
      tickerData = { type: 'events', events: tickerContent.events };
    } else if (tickerContent?.type === 'eventGroup' && tickerContent?.event) {
      // Single event assigned
      tickerData = { type: 'event', event: tickerContent.event };
    } else {
      // Default: use first few events' outcomes
      tickerData = { type: 'events', events: events.slice(0, 5) };
    }

    return {
      main: mainData,
      sidebar: sidebarData,
      lowerThird: lowerThirdData,
      ticker: tickerData,
      bigMovers: bigMovers, // Pass playlist-based big movers for sidebar default
    };
  }, [state.zones, markets, events, currentMarket, themes, getEventById, rotationIndex, bigMovers, trendingMarkets, priceHistoryCache, editorialList]);

  return (
    <ThemeProvider defaultTheme={state.theme || config?.defaultTheme}>
      <BroadcastLayout
        zones={state.zones}
        data={zoneData}
        config={config}
        flipped={state.flipped}
      />
    </ThemeProvider>
  );
}

export default Broadcast;
