/**
 * Outcome progress bar with price display
 */

import { useTheme } from '../../themes/index.jsx';
import { formatPrice, formatChange, getArrow } from '../../utils/formatters.js';

export function OutcomeBar({
  name,
  price,
  change,
  showChange = true,
  variant = 'default',
  size = 'md',
}) {
  const { colors } = useTheme();

  const percentage = Math.round(price * 100);
  const isPositive = change > 0.001;
  const isNegative = change < -0.001;

  const changeColor = isPositive ? colors.positive : isNegative ? colors.negative : colors.textMuted;

  const sizes = {
    sm: { height: '24px', fontSize: '12px', barHeight: '4px' },
    md: { height: '36px', fontSize: '14px', barHeight: '6px' },
    lg: { height: '48px', fontSize: '18px', barHeight: '8px' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontFamily: 'Source Sans 3, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: s.height,
      }}>
        <span style={{
          color: colors.text,
          fontSize: s.fontSize,
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {name}
        </span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          <span style={{
            color: colors.text,
            fontSize: s.fontSize,
            fontWeight: 600,
          }}>
            {formatPrice(price)}
          </span>

          {showChange && change !== undefined && (
            <span style={{
              color: changeColor,
              fontSize: `calc(${s.fontSize} - 2px)`,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}>
              {getArrow(change)} {formatChange(change)}
            </span>
          )}
        </div>
      </div>

      <div style={{
        height: s.barHeight,
        backgroundColor: colors.border,
        borderRadius: s.barHeight,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: colors.primary,
          borderRadius: s.barHeight,
          transition: 'width 0.5s ease-out',
        }} />
      </div>
    </div>
  );
}

export default OutcomeBar;
