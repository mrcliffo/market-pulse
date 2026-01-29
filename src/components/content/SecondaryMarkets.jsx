/**
 * Secondary Markets - 3-column grid of event cards
 * Each card shows top 4 outcomes for an event
 */

import { useTheme } from '../../themes/index.jsx';
import { formatPrice, formatVolume } from '../../utils/formatters.js';

function SecondaryCard({ event, colors, fonts }) {
  if (!event || !event.outcomes) return null;

  const outcomes = event.outcomes.slice(0, 4);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: colors.surface,
      borderRadius: '10px',
      padding: '16px',
      border: `1px solid ${colors.border}`,
      height: '100%',
    }}>
      {/* Category header */}
      <div style={{
        fontFamily: fonts.heading,
        fontSize: '15px',
        fontWeight: 600,
        color: colors.accent,
        marginBottom: '12px',
        lineHeight: 1.2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {event.title}
      </div>

      {/* Outcomes list */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        {outcomes.map((outcome, idx) => (
          <div
            key={outcome.marketId || idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: idx < outcomes.length - 1 ? `1px solid ${colors.border}40` : 'none',
            }}
          >
            <span style={{
              fontFamily: fonts.body,
              fontSize: '14px',
              color: idx === 0 ? colors.text : colors.textMuted,
              fontWeight: idx === 0 ? 500 : 400,
            }}>
              {idx + 1}. {outcome.name}
            </span>
            <span style={{
              fontFamily: fonts.heading,
              fontSize: '16px',
              fontWeight: 600,
              color: idx === 0 ? colors.secondary : colors.text,
            }}>
              {formatPrice(outcome.price)}
            </span>
          </div>
        ))}
      </div>

      {/* Volume footer */}
      {event.totalVolume && (
        <div style={{
          marginTop: '10px',
          fontFamily: fonts.body,
          fontSize: '11px',
          color: colors.textMuted,
        }}>
          {formatVolume(event.totalVolume)} staked
        </div>
      )}
    </div>
  );
}

export function SecondaryMarkets({ events = [], maxCards = 3 }) {
  const { colors, fonts } = useTheme();

  // Ensure we have exactly 3 slots (can be empty)
  const displayEvents = events.slice(0, maxCards);

  if (displayEvents.length === 0) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: colors.surface,
              borderRadius: '10px',
              padding: '24px',
              border: `1px solid ${colors.border}`,
              color: colors.textMuted,
              fontFamily: fonts.body,
              fontSize: '13px',
            }}
          >
            Secondary {i + 1}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
    }}>
      {displayEvents.map((event, idx) => (
        <SecondaryCard
          key={event?.id || idx}
          event={event}
          colors={colors}
          fonts={fonts}
        />
      ))}
      {/* Fill remaining slots with empty placeholders */}
      {Array(maxCards - displayEvents.length).fill(null).map((_, idx) => (
        <div
          key={`empty-${idx}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.surface,
            borderRadius: '10px',
            padding: '24px',
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
            fontFamily: fonts.body,
            fontSize: '13px',
          }}
        >
          Secondary {displayEvents.length + idx + 1}
        </div>
      ))}
    </div>
  );
}

export default SecondaryMarkets;
