/**
 * Ranked list of markets
 */

import { useTheme } from '../../themes/index.jsx';
import { formatPrice, formatChange, formatVolume, getArrow } from '../../utils/formatters.js';

function MarketListItem({ market, rank, showChange = true }) {
  const { colors } = useTheme();

  const outcome = market.outcomes?.[0];
  const change = outcome?.change24h || 0;
  const isPositive = change > 0.001;
  const isNegative = change < -0.001;
  const changeColor = isPositive ? colors.positive : isNegative ? colors.negative : colors.textMuted;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 12px',
      backgroundColor: colors.surface,
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
    }}>
      {/* Rank */}
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '18px',
        color: colors.textMuted,
        width: '24px',
        textAlign: 'center',
      }}>
        {rank}
      </div>

      {/* Market Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Source Sans 3, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: colors.text,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {outcome?.name || market.question}
        </div>
        <div style={{
          fontFamily: 'Source Sans 3, sans-serif',
          fontSize: '11px',
          color: colors.textMuted,
          marginTop: '2px',
        }}>
          {market.event?.title}
        </div>
      </div>

      {/* Price */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '2px',
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '16px',
          fontWeight: 600,
          color: colors.text,
        }}>
          {formatPrice(outcome?.price || 0)}
        </span>

        {showChange && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: changeColor,
          }}>
            {getArrow(change)} {formatChange(change)}
          </span>
        )}
      </div>
    </div>
  );
}

export function MarketList({
  markets = [],
  maxItems = 5,
  showRank = true,
  showChange = true,
  title,
}) {
  const { colors } = useTheme();

  const displayMarkets = markets.slice(0, maxItems);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {title && (
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '16px',
          letterSpacing: '0.1em',
          color: colors.accent,
          marginBottom: '4px',
        }}>
          {title}
        </div>
      )}

      {displayMarkets.map((market, index) => (
        <MarketListItem
          key={market.slug || market.id}
          market={market}
          rank={showRank ? index + 1 : null}
          showChange={showChange}
        />
      ))}
    </div>
  );
}

export default MarketList;
