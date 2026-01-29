/**
 * Big Movers - Shows markets with largest 24h price changes
 * Matches POC design: rank, market name, change percentage only
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTheme } from '../../themes/index.jsx';

/**
 * Format price change as percentage with sign
 */
function formatChange(change) {
  const pct = Math.abs(change * 100).toFixed(1);
  const sign = change >= 0 ? '+' : '-';
  return `${sign}${pct}%`;
}

/**
 * Convert slug to readable market question
 */
function slugToQuestion(slug) {
  if (!slug) return '';
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/^Will /, 'Will ')
    .replace(/ The /g, ' the ')
    .replace(/ A /g, ' a ')
    .replace(/ An /g, ' an ')
    .replace(/ Of /g, ' of ')
    .replace(/ In /g, ' in ')
    .replace(/ At /g, ' at ')
    .replace(/ To /g, ' to ')
    .replace(/ And /g, ' and ')
    .replace(/ Or /g, ' or ')
    .replace(/ For /g, ' for ')
    .replace(/\?$/, '')
    + '?';
}

export function BigMovers({ movers = [], maxItems = 5 }) {
  const { colors, fonts } = useTheme();
  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const prevPositionsRef = useRef({});
  const [animatingItems, setAnimatingItems] = useState({});

  const displayMovers = movers.slice(0, maxItems);

  // FLIP Animation: Record positions before DOM update
  useLayoutEffect(() => {
    const positions = {};
    Object.keys(itemRefs.current).forEach(id => {
      const el = itemRefs.current[id];
      if (el) {
        positions[id] = el.getBoundingClientRect();
      }
    });
    prevPositionsRef.current = positions;
  });

  // FLIP Animation: Animate after DOM update
  useEffect(() => {
    const prevPositions = prevPositionsRef.current;
    const newAnimating = {};

    displayMovers.forEach((mover, newIdx) => {
      const id = mover.marketId || mover.name;
      const el = itemRefs.current[id];

      if (el && prevPositions[id]) {
        const oldRect = prevPositions[id];
        const newRect = el.getBoundingClientRect();
        const deltaY = oldRect.top - newRect.top;

        if (Math.abs(deltaY) > 5) {
          el.style.transform = `translateY(${deltaY}px)`;
          el.style.transition = 'none';
          el.offsetHeight;
          el.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          el.style.transform = 'translateY(0)';

          const oldIdx = Object.keys(prevPositions).indexOf(id);
          if (oldIdx > newIdx) {
            newAnimating[id] = 'up';
          } else if (oldIdx < newIdx) {
            newAnimating[id] = 'down';
          }
        }
      }
    });

    if (Object.keys(newAnimating).length > 0) {
      setAnimatingItems(newAnimating);
      const timer = setTimeout(() => setAnimatingItems({}), 600);
      return () => clearTimeout(timer);
    }
  }, [JSON.stringify(displayMovers.map(m => m.marketId || m.name))]);

  if (displayMovers.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${colors.border}`,
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          fontFamily: fonts.body,
          fontSize: '14px',
        }}>
          No market movements to display
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* CSS Keyframes */}
      <style>{`
        @keyframes bigMoverUp {
          0% { background: rgba(0, 212, 170, 0.15); }
          100% { background: rgba(255, 255, 255, 0.02); }
        }
        @keyframes bigMoverDown {
          0% { background: rgba(255, 107, 107, 0.15); }
          100% { background: rgba(255, 255, 255, 0.02); }
        }
      `}</style>

      {/* Header - matching POC */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: colors.accent,
        }} />
        <h2 style={{
          fontFamily: fonts.heading,
          fontSize: '16px',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: colors.text,
          margin: 0,
        }}>
          24H Biggest Movers
        </h2>
      </div>

      {/* Movers list - evenly distributed */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        {displayMovers.map((mover, i) => {
          const change = mover.change24h || 0;
          const isPositive = change >= 0;
          const moverId = mover.marketId || mover.name;
          const animState = animatingItems[moverId];

          return (
            <div
              key={moverId}
              ref={el => { itemRefs.current[moverId] = el; }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '6px',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s',
                animation: animState === 'up' ? 'bigMoverUp 0.6s ease' :
                          animState === 'down' ? 'bigMoverDown 0.6s ease' : 'none',
              }}
            >
              {/* Rank */}
              <span style={{
                fontFamily: fonts.heading,
                fontSize: '18px',
                fontWeight: 600,
                color: colors.textMuted,
                width: '22px',
                flexShrink: 0,
              }}>
                {i + 1}
              </span>

              {/* Market question */}
              <div style={{
                flex: 1,
                minWidth: 0,
              }}>
                <div style={{
                  fontFamily: fonts.body,
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: colors.text,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {slugToQuestion(mover.slug)}
                </div>
              </div>

              {/* Change only - matching POC */}
              <span style={{
                fontFamily: fonts.heading,
                fontSize: '18px',
                fontWeight: 600,
                color: isPositive ? colors.positive : colors.negative,
                flexShrink: 0,
              }}>
                {formatChange(change)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BigMovers;
