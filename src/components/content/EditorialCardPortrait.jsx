/**
 * Portrait Editorial Card - single-column stacked layout for 9:16
 * Optimized for narrower viewport (1080px width)
 */

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../themes/index.jsx';
import { formatPrice, formatChange, formatVolume } from '../../utils/formatters.js';

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

  useEffect(() => {
    if (animate && previousValue !== undefined) {
      setDisplayWidth(previousValue * 100);
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
    return (
      <div style={{
        height: '14px',
        backgroundColor: '#ff4757',
        borderRadius: '7px',
        width: '100%',
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
          borderRadius: '7px 0 0 7px',
          transition: animate ? 'width 1.5s ease-out' : 'width 0.5s ease',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      height: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '7px',
      width: '100%',
      overflow: 'hidden',
    }}>
      <div
        style={{
          height: '100%',
          width: `${barWidth}%`,
          background: getBarGradient(),
          borderRadius: '7px',
          transition: animate ? 'width 1.5s ease-out' : 'width 0.5s ease',
        }}
      />
    </div>
  );
}

export function EditorialCardPortrait({ market }) {
  const { colors, fonts } = useTheme();
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [market?.id, market?.slug]);

  if (!market) return null;

  const outcome = market.outcomes?.[0];
  const price = outcome?.price || 0;
  const change = outcome?.change24h || 0;
  const isPositive = change > 0.001;
  const isNegative = change < -0.001;

  const previousPrice = price - change;
  const shouldAnimateBar = market.theme === 'bigMovers' || market.theme === 'fadingFast';

  const getStatVariant = () => {
    if (market.theme === 'fadingFast' || isNegative) return 'negative';
    if (market.theme === 'bigMovers' && isPositive) return 'positive';
    if (isPositive) return 'positive';
    return 'default';
  };

  const labelText = market.themeLabel || THEME_LABELS[market.theme] || 'MARKET';

  const getMarketTitle = () => {
    if (market.question) return market.question;
    return outcome?.name || market.slug || 'Unknown Market';
  };

  const getPrimaryStat = () => {
    if (shouldAnimateBar) {
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
      background: colors.surface,
      borderRadius: '12px',
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
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

      {/* Theme label */}
      <div style={{
        fontFamily: fonts.heading,
        fontSize: '18px',
        fontWeight: 600,
        letterSpacing: '2px',
        color: colors.accent,
        textTransform: 'uppercase',
      }}>
        {labelText}
      </div>

      {/* Market title */}
      <div style={{
        fontFamily: fonts.heading,
        fontSize: '28px',
        fontWeight: 600,
        color: colors.text,
        lineHeight: 1.2,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1,
      }}>
        {getMarketTitle()}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: fonts.heading,
          fontSize: '36px',
          fontWeight: 600,
          color: isNegative ? colors.negative : isPositive ? colors.positive : colors.text,
          whiteSpace: 'nowrap',
        }}>
          {getPrimaryStat()}
        </div>

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

      {/* Stat bar - full width */}
      <AnimatedStatBar
        key={animationKey}
        currentValue={price}
        previousValue={shouldAnimateBar ? previousPrice : price}
        variant={getStatVariant()}
        showSplit={market.theme === 'debateFuel' || market.theme === 'mostEngaged'}
        animate={shouldAnimateBar}
      />

      {/* Editorial copy - essential themed content */}
      {market.editorialCopy && (
        <div style={{
          fontFamily: fonts.body,
          fontSize: '20px',
          fontWeight: 400,
          color: colors.text,
          lineHeight: 1.4,
          fontStyle: 'italic',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          "{market.editorialCopy}"
        </div>
      )}

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

export default EditorialCardPortrait;
