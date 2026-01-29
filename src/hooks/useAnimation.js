/**
 * Hook for zone animation state machine
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Animation states: 'off' -> 'entering' -> 'on' -> 'exiting' -> 'off'
const STATES = {
  OFF: 'off',
  ENTERING: 'entering',
  ON: 'on',
  EXITING: 'exiting',
};

const DEFAULT_DURATIONS = {
  entering: 400,
  exiting: 400,
};

export function useAnimation(options = {}) {
  const {
    initialState = STATES.OFF,
    enterDuration = DEFAULT_DURATIONS.entering,
    exitDuration = DEFAULT_DURATIONS.exiting,
    onEnterComplete,
    onExitComplete,
  } = options;

  const [state, setState] = useState(initialState);
  const timeoutRef = useRef(null);

  // Clear any pending timeouts
  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Show the element (trigger enter animation)
  const show = useCallback(() => {
    clearPendingTimeout();

    // If currently exiting, interrupt and start entering
    setState(STATES.ENTERING);

    timeoutRef.current = setTimeout(() => {
      setState(STATES.ON);
      onEnterComplete?.();
    }, enterDuration);
  }, [enterDuration, onEnterComplete, clearPendingTimeout]);

  // Hide the element (trigger exit animation)
  const hide = useCallback(() => {
    clearPendingTimeout();

    if (state === STATES.OFF) return;

    setState(STATES.EXITING);

    timeoutRef.current = setTimeout(() => {
      setState(STATES.OFF);
      onExitComplete?.();
    }, exitDuration);
  }, [state, exitDuration, onExitComplete, clearPendingTimeout]);

  // Toggle visibility
  const toggle = useCallback(() => {
    if (state === STATES.OFF || state === STATES.EXITING) {
      show();
    } else {
      hide();
    }
  }, [state, show, hide]);

  // Immediately set to a state (no animation)
  const setImmediate = useCallback((newState) => {
    clearPendingTimeout();
    setState(newState);
  }, [clearPendingTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearPendingTimeout();
  }, [clearPendingTimeout]);

  return {
    state,
    isVisible: state !== STATES.OFF,
    isAnimating: state === STATES.ENTERING || state === STATES.EXITING,
    show,
    hide,
    toggle,
    setImmediate,
    STATES,
  };
}

/**
 * Hook for managing multiple zone animations
 */
export function useZoneAnimations(zoneIds = []) {
  const [zones, setZones] = useState(() => {
    const initial = {};
    for (const id of zoneIds) {
      initial[id] = {
        state: STATES.OFF,
        content: null,
      };
    }
    return initial;
  });

  const timeoutsRef = useRef({});

  const setZoneState = useCallback((zoneId, state, content = null) => {
    setZones(prev => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        state,
        content: content !== null ? content : prev[zoneId]?.content,
      },
    }));
  }, []);

  const showZone = useCallback((zoneId, content = null, duration = DEFAULT_DURATIONS.entering) => {
    // Clear any pending timeout
    if (timeoutsRef.current[zoneId]) {
      clearTimeout(timeoutsRef.current[zoneId]);
    }

    setZoneState(zoneId, STATES.ENTERING, content);

    timeoutsRef.current[zoneId] = setTimeout(() => {
      setZoneState(zoneId, STATES.ON);
    }, duration);
  }, [setZoneState]);

  const hideZone = useCallback((zoneId, duration = DEFAULT_DURATIONS.exiting) => {
    if (timeoutsRef.current[zoneId]) {
      clearTimeout(timeoutsRef.current[zoneId]);
    }

    setZoneState(zoneId, STATES.EXITING);

    timeoutsRef.current[zoneId] = setTimeout(() => {
      setZoneState(zoneId, STATES.OFF);
    }, duration);
  }, [setZoneState]);

  const toggleZone = useCallback((zoneId, content = null) => {
    const currentState = zones[zoneId]?.state || STATES.OFF;
    if (currentState === STATES.OFF || currentState === STATES.EXITING) {
      showZone(zoneId, content);
    } else {
      hideZone(zoneId);
    }
  }, [zones, showZone, hideZone]);

  // Cleanup
  useEffect(() => {
    return () => {
      for (const timeout of Object.values(timeoutsRef.current)) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return {
    zones,
    showZone,
    hideZone,
    toggleZone,
    setZoneState,
    STATES,
  };
}

export default useAnimation;
