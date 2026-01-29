/**
 * Editorial themed content card - broadcast lower third style
 * Two-column layout with animated gradient border and animated stat bar
 */

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../themes/index.jsx';
import { formatPrice, formatChange, formatVolume } from '../../utils/formatters.js';

// Theme-specific label colors
const LABEL_COLORS = {
  bigMovers: '#ff6b2b',      // Orange
  debateFuel: '#a29bfe',     // Purple
  sentimentGaps: '#00b4ff',  // Blue
  longshotWatch: '#f1c40f',  // Yellow
  crowdFavorites: '#e056fd', // Pink
  volumeSurge: '#00cec9',    // Teal
  fadingFast: '#ff4757',     // Red
  mostEngaged: '#fd79a8',    // Rose
  freshMarkets: '#00d68f',   // Green
};

// Theme labels for display
const THEME_LABELS = {
  bigMovers: 'BIG MOVER',
  debateFuel: 'DEBATE FUEL',
  sentimentGaps: 'SENTIMENT GAP',
  longshotWatch: 'LONGSHOT WATCH',
  crowdFavorites: 'CROWD FAVORITE',
  volumeSurge: 'VOLUME SURGE',
  fadingFast: 'FADING FAST',
  mostEngaged: 'MOST ENGAGED',
  freshMarkets: 'FRESH MARKET',
};

function AnimatedStatBar({ currentValue, previousValue, variant = 'default', showSplit = false, animate = false }) {
  const { colors } = useTheme();
  const [displayWidth, setDisplayWidth] = useState(previousValue * 100);
  const barRef = useRef(null);

  // Animate bar from previous to current value
  useEffect(() => {
    if (animate && previousValue !== undefined) {
      // Start at previous value
      setDisplayWidth(previousValue * 100);

      // Animate to current value after a short delay
      const timer = setTimeout(() => {
        setDisplayWidth(currentValue * 100);
      }, 150);

      return () => clearTimeout(timer);
    } else {
      setDisplayWidth(currentValue * 100);
    }
  }, [currentValue, previousValue, animate]);

  const barWidth = Math.max(0, Math.min(100, displayWidth));

  const getBarGradient = () => {
    switch (variant) {
      case 'positive':
        return `linear-gradient(90deg, #00d68f 0%, #00e6a0 100%)`;
      case 'negative':
        return `linear-gradient(90deg, #ff4757 0%, #ff6b7a 100%)`;
      default:
        return `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.primary} 100%)`;
    }
  };

  if (showSplit) {
    // Split bar for crowd vs market comparison (YES green / NO red)
    return (
      <div style={{
        height: '16px',
        backgroundColor: '#ff4757',
        borderRadius: '8px',
        flex: 1,
        minWidth: '150px',
        maxWidth: '300px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${barWidth}%`,
          background: '#00d68f',
          borderRadius: '8px 0 0 8px',
          transition: animate ? 'width 1.5s ease-out' : 'width 0.5s ease',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      height: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      flex: 1,
      minWidth: '150px',
      maxWidth: '300px',
      overflow: 'hidden',
    }}>
      <div
        ref={barRef}
        style={{
          height: '100%',
          width: `${barWidth}%`,
          background: getBarGradient(),
          borderRadius: '8px',
          transition: animate ? 'width 1.5s ease-out' : 'width 0.5s ease',
        }}
      />
    </div>
  );
}

export function EditorialCard({ market }) {
  const { colors, fonts } = useTheme();
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger animation when market changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [market?.id, market?.slug]);

  if (!market) return null;

  const outcome = market.outcomes?.[0];
  const price = outcome?.price || 0;
  const change = outcome?.change24h || 0;
  const isPositive = change > 0.001;
  const isNegative = change < -0.001;

  // Calculate previous price from change
  const previousPrice = price - change;

  // Determine if bar should animate (for movers/faders)
  const shouldAnimateBar = market.theme === 'bigMovers' || market.theme === 'fadingFast';

  // Determine stat bar variant based on theme or change
  const getStatVariant = () => {
    if (market.theme === 'fadingFast' || isNegative) return 'negative';
    if (market.theme === 'bigMovers' && isPositive) return 'positive';
    if (isPositive) return 'positive';
    return 'default';
  };

  // Get theme-specific label color and label text
  const labelColor = market.themeColor || LABEL_COLORS[market.theme] || colors.accent;
  const labelText = market.themeLabel || THEME_LABELS[market.theme] || 'MARKET';

  // Get full market title (question, not just outcome name)
  const getMarketTitle = () => {
    // Use the full question if available
    if (market.question) return market.question;
    // Fallback to outcome name or slug
    return outcome?.name || market.slug || 'Unknown Market';
  };

  // Format the primary stat based on theme
  const getPrimaryStat = () => {
    if (shouldAnimateBar) {
      // Show "X% → Y%" for movers
      return `${(previousPrice * 100).toFixed(1)}% → ${(price * 100).toFixed(1)}%`;
    }
    if (market.theme === 'debateFuel') {
      return `YES ${(price * 100).toFixed(0)}%`;
    }
    if (market.theme === 'sentimentGaps') {
      return `Market: ${(price * 100).toFixed(0)}%`;
    }
    if (market.theme === 'crowdFavorites' && market.conviction) {
      return `${(market.conviction * 100).toFixed(0)}% say YES`;
    }
    if (market.theme === 'volumeSurge' && market.volume24h) {
      return formatVolume(market.volume24h) + ' in 24h';
    }
    return formatPrice(price);
  };

  // Get secondary stat text
  const getSecondaryStat = () => {
    if (shouldAnimateBar) {
      return `(${change > 0 ? '+' : ''}${(change * 100).toFixed(1)}% today)`;
    }
    if (market.theme === 'debateFuel') {
      return `NO ${((1 - price) * 100).toFixed(0)}%`;
    }
    if (market.theme === 'sentimentGaps' && market.crowdVote !== undefined) {
      const gap = ((market.crowdVote - price) * 100).toFixed(0);
      return `Fans: ${(market.crowdVote * 100).toFixed(0)}% (${gap > 0 ? '+' : ''}${gap}% gap)`;
    }
    if (change !== 0) {
      return `${isPositive ? '+' : ''}${formatChange(change)}`;
    }
    return '';
  };

  return (
    <div style={{
      position: 'relative',
      flex: 1,
      background: `linear-gradient(135deg, ${colors.surface} 0%, rgba(30, 30, 45, 1) 100%)`,
      borderRadius: '12px',
      padding: '20px 30px',
      display: 'flex',
      gap: '40px',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Animated gradient border */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '12px',
        padding: '2px',
        background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary}, ${colors.secondary})`,
        backgroundSize: '200% 100%',
        animation: 'border-shift 4s ease infinite',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
      }} />

      {/* Left column - 55% */}
      <div style={{
        flex: '0 0 55%',
        maxWidth: '55%',
      }}>
        {/* Theme label */}
        <div style={{
          fontFamily: fonts.heading,
          fontSize: '16px',
          fontWeight: 600,
          letterSpacing: '2px',
          color: labelColor,
          marginBottom: '10px',
          textTransform: 'uppercase',
        }}>
          {labelText}
        </div>

        {/* Market title - full question */}
        <div style={{
          fontFamily: fonts.heading,
          fontSize: '26px',
          fontWeight: 600,
          color: colors.text,
          marginBottom: '12px',
          lineHeight: 1.2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {getMarketTitle()}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Primary stat */}
          <div style={{
            fontFamily: fonts.heading,
            fontSize: '36px',
            fontWeight: 600,
            color: isNegative ? colors.negative : isPositive ? colors.positive : colors.text,
            whiteSpace: 'nowrap',
          }}>
            {getPrimaryStat()}
          </div>

          {/* Animated stat bar */}
          <AnimatedStatBar
            key={animationKey}
            currentValue={price}
            previousValue={shouldAnimateBar ? previousPrice : price}
            variant={getStatVariant()}
            showSplit={market.theme === 'debateFuel' || market.theme === 'mostEngaged'}
            animate={shouldAnimateBar}
          />

          {/* Secondary stat */}
          {getSecondaryStat() && (
            <div style={{
              fontFamily: fonts.body,
              fontSize: '20px',
              fontWeight: 600,
              color: isNegative ? colors.negative : isPositive ? colors.positive : colors.textMuted,
              whiteSpace: 'nowrap',
            }}>
              {getSecondaryStat()}
            </div>
          )}
        </div>
      </div>

      {/* Right column - 40% */}
      <div style={{
        flex: '0 0 40%',
        maxWidth: '40%',
        paddingLeft: '30px',
        borderLeft: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {/* Editorial copy */}
        <div style={{
          fontFamily: fonts.body,
          fontSize: '22px',
          fontWeight: 400,
          color: colors.text,
          lineHeight: 1.4,
          marginBottom: '12px',
          fontStyle: 'italic',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          "{market.editorialCopy || 'The market is moving.'}"
        </div>

        {/* Meta info */}
        <div style={{
          fontFamily: fonts.body,
          fontSize: '16px',
          color: colors.textMuted,
          display: 'flex',
          gap: '16px',
        }}>
          {market.volume > 0 && (
            <span>{formatVolume(market.volume)} volume</span>
          )}
          {market.voteCount > 0 && (
            <span>{market.voteCount.toLocaleString()} votes</span>
          )}
          {market.crowdVote !== undefined && market.gap !== undefined && (
            <span>
              Market {formatPrice(price)} vs Crowd {formatPrice(market.crowdVote)}
            </span>
          )}
        </div>
      </div>

      {/* CSS animation for border */}
      <style>{`
        @keyframes border-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}

export default EditorialCard;
