/**
 * Featured Market - Hero display for main zone
 * Shows a single event with large typography and prominent odds
 * Or shows top trending markets from playlist when no event selected
 */

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../themes/index.jsx';
import { formatPrice, formatVolume } from '../../utils/formatters.js';

/**
 * Bar chart sparkline for 7-day price trend (matches POC design)
 */
function PriceTrendBars({ data, colors, height = '100%' }) {
  const bars = 40;

  const heights = useMemo(() => {
    if (!data || data.length < 2) {
      // Generate placeholder bars with slight variation
      return Array(bars).fill(0).map((_, i) => 30 + Math.sin(i * 0.3) * 20);
    }

    // Sample data to fit bars
    const step = Math.max(1, Math.floor(data.length / bars));
    const sampled = [];
    for (let i = 0; i < data.length && sampled.length < bars; i += step) {
      sampled.push(data[i].p);
    }

    // Normalize to 15-100% height range
    const minPrice = Math.min(...sampled);
    const maxPrice = Math.max(...sampled);
    const range = maxPrice - minPrice || 0.01;

    return sampled.map(p => {
      const normalized = ((p - minPrice) / range) * 85 + 15;
      return Math.max(15, Math.min(100, normalized));
    });
  }, [data]);

  // Determine trend color
  const trendUp = data && data.length >= 2 && data[data.length - 1].p >= data[0].p;
  const barColor = trendUp ? colors.positive : colors.negative;

  return (
    <div style={{
      height,
      display: 'flex',
      alignItems: 'flex-end',
      gap: '4px',
    }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}30 100%)`,
            borderRadius: '3px 3px 0 0',
            transition: 'height 0.5s ease',
          }}
        />
      ))}
    </div>
  );
}

export function FeaturedMarket({ event, trending, priceHistoryCache = {}, maxOutcomes = 6, rotationInterval = 20000 }) {
  const { colors, fonts } = useTheme();
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotation timer for trending markets
  useEffect(() => {
    if (!trending || trending.length <= 1) return;

    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setRotationIndex(prev => (prev + 1) % trending.length);
        setIsAnimating(false);
      }, 300); // Match fade-out duration
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [trending, rotationInterval]);

  // Reset rotation when trending data changes
  useEffect(() => {
    setRotationIndex(0);
  }, [trending?.length]);

  // Get current leader based on rotation (for trending mode)
  const currentLeader = trending?.[rotationIndex] || trending?.[0];

  // Use pre-fetched price history from cache (no per-rotation fetching)
  const leaderTokenId = currentLeader?.tokenId || event?.outcomes?.[0]?.tokenId;
  const priceHistory = leaderTokenId ? priceHistoryCache[leaderTokenId] : null;

  // Trending mode: show top markets from playlist
  if (!event && trending?.length > 0) {
    const leader = currentLeader;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: colors.surface,
        borderRadius: '12px',
        padding: '24px',
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
      }}>
        {/* Header */}
        <div style={{
          fontFamily: fonts.heading,
          fontSize: '12px',
          fontWeight: 600,
          color: colors.accent,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          TOP TRENDING MARKETS
        </div>

        {/* Leader highlight with animation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          background: `linear-gradient(90deg, ${colors.accent}15 0%, transparent 100%)`,
          borderRadius: '8px',
          borderLeft: `4px solid ${colors.accent}`,
          marginBottom: '16px',
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: '12px',
            fontWeight: 600,
            color: colors.accent,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            #{rotationIndex + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: fonts.heading,
              fontSize: '22px',
              fontWeight: 700,
              color: colors.text,
              marginBottom: '2px',
            }}>
              {leader.name}
            </div>
            <div style={{
              fontFamily: fonts.body,
              fontSize: '11px',
              color: colors.textMuted,
            }}>
              {leader.eventTitle}
            </div>
          </div>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: '32px',
            fontWeight: 700,
            color: colors.accent,
          }}>
            {formatPrice(leader.price)}
          </div>
        </div>

        {/* 7-Day Price Trend with animation */}
        <div style={{
          flex: 1,
          padding: '16px 20px',
          backgroundColor: `${colors.surface}60`,
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          opacity: isAnimating ? 0 : 1,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <div style={{
              fontFamily: fonts.body,
              fontSize: '11px',
              color: colors.textMuted,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              7-Day Price Trend
            </div>
            {leader.volume > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  fontFamily: fonts.body,
                  fontSize: '11px',
                  color: colors.textMuted,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  24h Volume
                </span>
                <span style={{
                  fontFamily: fonts.heading,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.secondary,
                }}>
                  {formatVolume(leader.volume)}
                </span>
              </div>
            )}
          </div>
          <div style={{ flex: 1, minHeight: '80px' }}>
            <PriceTrendBars data={priceHistory} colors={colors} />
          </div>
        </div>
      </div>
    );
  }

  if (!event || !event.outcomes) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: colors.textMuted,
        fontFamily: fonts.body,
        fontSize: '16px',
      }}>
        No featured market assigned
      </div>
    );
  }

  const outcomes = event.outcomes.slice(0, maxOutcomes);
  const leader = outcomes[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: colors.surface,
      borderRadius: '12px',
      padding: '24px',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: '12px',
            fontWeight: 600,
            color: colors.accent,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            FEATURED MARKET
          </div>
          <h2 style={{
            fontFamily: fonts.heading,
            fontSize: '28px',
            fontWeight: 700,
            color: colors.text,
            margin: 0,
            lineHeight: 1.2,
          }}>
            {event.title}
          </h2>
        </div>
        {event.totalVolume && (
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: fonts.body,
              fontSize: '11px',
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Total Volume
            </div>
            <div style={{
              fontFamily: fonts.heading,
              fontSize: '20px',
              fontWeight: 700,
              color: colors.secondary,
            }}>
              {formatVolume(event.totalVolume)}
            </div>
          </div>
        )}
      </div>

      {/* Leader highlight */}
      {leader && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '16px 20px',
          background: `linear-gradient(90deg, ${colors.accent}15 0%, transparent 100%)`,
          borderRadius: '8px',
          borderLeft: `4px solid ${colors.accent}`,
          marginBottom: '20px',
        }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: '14px',
            fontWeight: 600,
            color: colors.accent,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            LEADER
          </div>
          <div style={{
            flex: 1,
            fontFamily: fonts.heading,
            fontSize: '24px',
            fontWeight: 700,
            color: colors.text,
          }}>
            {leader.name}
          </div>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: '36px',
            fontWeight: 700,
            color: colors.accent,
          }}>
            {formatPrice(leader.price)}
          </div>
        </div>
      )}

      {/* 7-Day Price Trend */}
      {priceHistory && priceHistory.length > 0 && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: `${colors.surface}60`,
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            fontFamily: fonts.body,
            fontSize: '11px',
            color: colors.textMuted,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>
            7-Day Price Trend
          </div>
          <PriceTrendBars data={priceHistory} colors={colors} />
        </div>
      )}

      {/* Outcomes grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        overflow: 'hidden',
      }}>
        {outcomes.slice(1).map((outcome, idx) => (
          <div
            key={outcome.marketId || idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: `${colors.surface}80`,
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{
                fontFamily: fonts.heading,
                fontSize: '14px',
                fontWeight: 600,
                color: colors.textMuted,
                width: '20px',
              }}>
                {idx + 2}
              </span>
              <span style={{
                fontFamily: fonts.body,
                fontSize: '16px',
                fontWeight: 500,
                color: colors.text,
              }}>
                {outcome.name}
              </span>
            </div>
            <span style={{
              fontFamily: fonts.heading,
              fontSize: '22px',
              fontWeight: 700,
              color: colors.secondary,
            }}>
              {formatPrice(outcome.price)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedMarket;
