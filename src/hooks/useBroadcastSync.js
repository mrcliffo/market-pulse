/**
 * Hook for synchronizing state between control panel and broadcast via Supabase Realtime
 * Falls back to BroadcastChannel for same-browser communication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '../lib/supabase.js';

const CHANNEL_NAME = 'market-pulse-control';
const BROADCAST_STATE_ID = 'default';

// Message types (for BroadcastChannel fallback)
export const MESSAGE_TYPES = {
  ZONE_VISIBILITY: 'ZONE_VISIBILITY',
  ASSIGN_CONTENT: 'ASSIGN_CONTENT',
  SET_THEME: 'SET_THEME',
  SET_FLIPPED: 'SET_FLIPPED',
  PIN_MARKET: 'PIN_MARKET',
  UNPIN_MARKET: 'UNPIN_MARKET',
  REQUEST_STATE: 'REQUEST_STATE',
  STATE_UPDATE: 'STATE_UPDATE',
};

const DEFAULT_STATE = {
  zones: {
    header: { visible: true, content: null },
    main: { visible: true, content: { type: 'featuredLayout' } },
    sidebar: { visible: true, content: null },
    lowerThird: { visible: true, content: null },
    bottomCorner: { visible: true, content: null },
    ticker: { visible: true, content: null },
  },
  theme: 'default',
  flipped: false,
  pinnedMarkets: [],
};

// Parse URL params to override zone visibility
function getUrlOverrides() {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const hideZones = params.get('hide')?.split(',').map(z => z.trim()) || [];
  const showZones = params.get('show')?.split(',').map(z => z.trim()) || [];

  return { hideZones, showZones };
}

function applyUrlOverrides(state) {
  const { hideZones, showZones } = getUrlOverrides();
  const newState = JSON.parse(JSON.stringify(state));

  for (const zone of hideZones) {
    if (newState.zones[zone]) {
      newState.zones[zone].visible = false;
    }
  }

  for (const zone of showZones) {
    if (newState.zones[zone]) {
      newState.zones[zone].visible = true;
    }
  }

  return newState;
}

export function useBroadcastSync(options = {}) {
  const { isController = false, onMessage } = options;

  const [state, setState] = useState(() => applyUrlOverrides(DEFAULT_STATE));
  const [connected, setConnected] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const channelRef = useRef(null);
  const supabaseChannelRef = useRef(null);
  const stateRef = useRef(state);

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Fetch initial state from Supabase
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    async function fetchInitialState() {
      try {
        const { data, error } = await supabase
          .from('broadcast_state')
          .select('state')
          .eq('id', BROADCAST_STATE_ID)
          .single();

        if (error) {
          console.warn('Failed to fetch broadcast state:', error.message);
          return;
        }

        if (data?.state) {
          setState(applyUrlOverrides(data.state));
        }
      } catch (err) {
        console.warn('Error fetching broadcast state:', err);
      }
    }

    fetchInitialState();
  }, []);

  // Subscribe to Supabase Realtime
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Subscribe to changes on broadcast_state table
    const channel = supabase
      .channel('broadcast-state-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'broadcast_state',
          filter: `id=eq.${BROADCAST_STATE_ID}`,
        },
        (payload) => {
          console.log('Received realtime update:', payload);
          if (payload.new?.state) {
            setState(applyUrlOverrides(payload.new.state));
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase realtime status:', status);
        setSupabaseConnected(status === 'SUBSCRIBED');
      });

    supabaseChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Also use BroadcastChannel for same-browser communication (faster)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) {
      return;
    }

    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    setConnected(true);

    channelRef.current.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case MESSAGE_TYPES.ZONE_VISIBILITY:
          setState(prev => applyUrlOverrides({
            ...prev,
            zones: {
              ...prev.zones,
              [payload.zone]: {
                ...prev.zones[payload.zone],
                visible: payload.visible,
              },
            },
          }));
          break;

        case MESSAGE_TYPES.ASSIGN_CONTENT:
          setState(prev => applyUrlOverrides({
            ...prev,
            zones: {
              ...prev.zones,
              [payload.zone]: {
                ...prev.zones[payload.zone],
                content: payload.content,
              },
            },
          }));
          break;

        case MESSAGE_TYPES.SET_THEME:
          setState(prev => ({ ...prev, theme: payload.themeId }));
          break;

        case MESSAGE_TYPES.SET_FLIPPED:
          setState(prev => ({ ...prev, flipped: payload.flipped }));
          break;

        case MESSAGE_TYPES.PIN_MARKET:
          setState(prev => ({
            ...prev,
            pinnedMarkets: [...new Set([...prev.pinnedMarkets, payload.slug])],
          }));
          break;

        case MESSAGE_TYPES.UNPIN_MARKET:
          setState(prev => ({
            ...prev,
            pinnedMarkets: prev.pinnedMarkets.filter(s => s !== payload.slug),
          }));
          break;

        case MESSAGE_TYPES.STATE_UPDATE:
          setState(applyUrlOverrides(payload.state));
          break;

        case MESSAGE_TYPES.REQUEST_STATE:
          if (isController) {
            channelRef.current?.postMessage({
              type: MESSAGE_TYPES.STATE_UPDATE,
              payload: { state: stateRef.current },
            });
          }
          break;
      }

      onMessage?.(type, payload);
    };

    if (!isController) {
      channelRef.current.postMessage({ type: MESSAGE_TYPES.REQUEST_STATE });
    }

    return () => {
      channelRef.current?.close();
      setConnected(false);
    };
  }, [isController, onMessage]);

  // Save state to Supabase (for controllers)
  const saveToSupabase = useCallback(async (newState) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('broadcast_state')
        .update({ state: newState, updated_at: new Date().toISOString() })
        .eq('id', BROADCAST_STATE_ID);

      if (error) {
        console.error('Failed to save broadcast state:', error);
      }
    } catch (err) {
      console.error('Error saving broadcast state:', err);
    }
  }, []);

  // Send message via BroadcastChannel
  const send = useCallback((type, payload) => {
    if (!channelRef.current) return;
    channelRef.current.postMessage({ type, payload });
  }, []);

  // Control functions - update local state, broadcast via BroadcastChannel, and save to Supabase
  const setZoneVisibility = useCallback((zone, visible) => {
    send(MESSAGE_TYPES.ZONE_VISIBILITY, { zone, visible });
    setState(prev => {
      const newState = {
        ...prev,
        zones: {
          ...prev.zones,
          [zone]: { ...prev.zones[zone], visible },
        },
      };
      if (isController) saveToSupabase(newState);
      return newState;
    });
  }, [send, isController, saveToSupabase]);

  const assignContent = useCallback((zone, content) => {
    send(MESSAGE_TYPES.ASSIGN_CONTENT, { zone, content });
    setState(prev => {
      const newState = {
        ...prev,
        zones: {
          ...prev.zones,
          [zone]: { ...prev.zones[zone], content },
        },
      };
      if (isController) saveToSupabase(newState);
      return newState;
    });
  }, [send, isController, saveToSupabase]);

  const setTheme = useCallback((themeId) => {
    send(MESSAGE_TYPES.SET_THEME, { themeId });
    setState(prev => {
      const newState = { ...prev, theme: themeId };
      if (isController) saveToSupabase(newState);
      return newState;
    });
  }, [send, isController, saveToSupabase]);

  const setFlipped = useCallback((flipped) => {
    send(MESSAGE_TYPES.SET_FLIPPED, { flipped });
    setState(prev => {
      const newState = { ...prev, flipped };
      if (isController) saveToSupabase(newState);
      return newState;
    });
  }, [send, isController, saveToSupabase]);

  const pinMarket = useCallback((slug) => {
    send(MESSAGE_TYPES.PIN_MARKET, { slug });
    setState(prev => {
      const newState = {
        ...prev,
        pinnedMarkets: [...new Set([...prev.pinnedMarkets, slug])],
      };
      if (isController) saveToSupabase(newState);
      return newState;
    });
  }, [send, isController, saveToSupabase]);

  const unpinMarket = useCallback((slug) => {
    send(MESSAGE_TYPES.UNPIN_MARKET, { slug });
    setState(prev => {
      const newState = {
        ...prev,
        pinnedMarkets: prev.pinnedMarkets.filter(s => s !== slug),
      };
      if (isController) saveToSupabase(newState);
      return newState;
    });
  }, [send, isController, saveToSupabase]);

  return {
    state,
    connected: connected || supabaseConnected,
    supabaseConnected,
    setZoneVisibility,
    assignContent,
    setTheme,
    setFlipped,
    pinMarket,
    unpinMarket,
    send,
  };
}

export default useBroadcastSync;
