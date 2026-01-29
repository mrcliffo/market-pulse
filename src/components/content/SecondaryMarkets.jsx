/**
 * Secondary Markets - Grid of event cards
 * Landscape: 3 columns, 4 outcomes per card
 * Portrait: 2 columns, 5 outcomes per card
 */

import { useTheme } from '../../themes/index.jsx';
import { formatPrice, formatVolume } from '../../utils/formatters.js';

function SecondaryCard({ event, colors, fonts, maxOutcomes = 4 }) {
  if (!event || !event.outcomes) return null;

  const outcomes = event.outcomes.slice(0, maxOutcomes);

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
        gap: '4px',
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
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              marginRight: '8px',
            }}>
              {idx + 1}. {outcome.name}
            </span>
            <span style={{
              fontFamily: fonts.heading,
              fontSize: '16px',
              fontWeight: 600,
              color: idx === 0 ? colors.secondary : colors.text,
              flexShrink: 0,
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

export function SecondaryMarkets({ events = [], maxCards = 3, portrait = false }) {
  const { colors, fonts } = useTheme();

  // Portrait: 2 columns, 5 outcomes. Landscape: 3 columns, 4 outcomes
  const columns = portrait ? 2 : maxCards;
  const outcomesPerCard = portrait ? 5 : 4;

  // Ensure we have exactly the right number of slots
  const displayEvents = events.slice(0, columns);

  if (displayEvents.length === 0) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: portrait ? '12px' : '16px',
        height: '100%',
      }}>
        {Array(columns).fill(null).map((_, i) => (
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
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: portrait ? '12px' : '16px',
      height: '100%',
    }}>
      {displayEvents.map((event, idx) => (
        <SecondaryCard
          key={event?.id || idx}
          event={event}
          colors={colors}
          fonts={fonts}
          maxOutcomes={outcomesPerCard}
        />
      ))}
      {/* Fill remaining slots with empty placeholders */}
      {Array(columns - displayEvents.length).fill(null).map((_, idx) => (
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
