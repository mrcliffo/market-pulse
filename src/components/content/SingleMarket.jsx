/**
 * Single market hero display with full details
 */

import { useTheme } from '../../themes/index.jsx';
import { OutcomeBar } from '../ui/OutcomeBar.jsx';
import { Sparkline } from '../ui/Sparkline.jsx';
import { formatVolume } from '../../utils/formatters.js';

export function SingleMarket({
  market,
  showSparkline = true,
  showVolume = true,
  variant = 'default',
}) {
  const { colors } = useTheme();

  if (!market) return null;

  const outcome = market.outcomes?.[0];
  const sparklineData = outcome?.sparkline || [];

  return (
    <div style={{
      backgroundColor: colors.surface,
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${colors.border}`,
    }}>
      {/* Event Title */}
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '14px',
        letterSpacing: '0.1em',
        color: colors.accent,
        marginBottom: '8px',
      }}>
        {market.event?.title}
      </div>

      {/* Question */}
      <div style={{
        fontFamily: 'Source Sans 3, sans-serif',
        fontSize: '20px',
        fontWeight: 700,
        color: colors.text,
        marginBottom: '16px',
        lineHeight: 1.3,
      }}>
        {market.question}
      </div>

      {/* Outcome Bar */}
      <OutcomeBar
        name={outcome?.name || 'Yes'}
        price={outcome?.price || 0}
        change={outcome?.change24h}
        showChange={true}
        size="lg"
      />

      {/* Sparkline and Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: '16px',
        gap: '20px',
      }}>
        {showSparkline && sparklineData.length > 1 && (
          <Sparkline
            data={sparklineData}
            width={160}
            height={50}
          />
        )}

        {showVolume && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
          }}>
            <span style={{
              fontFamily: 'Source Sans 3, sans-serif',
              fontSize: '12px',
              color: colors.textMuted,
            }}>
              Volume
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '16px',
              fontWeight: 600,
              color: colors.text,
            }}>
              {formatVolume(market.volume)}
            </span>
          </div>
        )}
      </div>

      {/* Editorial Badge */}
      {market.themeLabel && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: market.themeColor || colors.primary,
          color: '#000',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '11px',
          letterSpacing: '0.05em',
          padding: '4px 8px',
          borderRadius: '4px',
        }}>
          {market.themeLabel}
        </div>
      )}
    </div>
  );
}

export default SingleMarket;
