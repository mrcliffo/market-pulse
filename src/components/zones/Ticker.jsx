/**
 * Ticker zone - scrolling grouped market outcomes
 */

import { useTheme } from '../../themes/index.jsx';
import { formatPrice } from '../../utils/formatters.js';

function EventSection({ event, fonts, colors }) {
  if (!event || !event.outcomes) return null;

  // Get top outcomes to display
  const outcomes = event.outcomes.slice(0, 8);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      marginRight: '80px',
      whiteSpace: 'nowrap',
    }}>
      {/* Event title badge */}
      <span style={{
        fontFamily: fonts.heading,
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '1px',
        color: colors.surface,
        backgroundColor: colors.accent,
        padding: '6px 14px',
        borderRadius: '4px',
        marginRight: '20px',
        textTransform: 'uppercase',
      }}>
        {event.title}
      </span>

      {/* Outcomes */}
      {outcomes.map((outcome, idx) => (
        <span
          key={outcome.marketId || idx}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginRight: '32px',
          }}
        >
          <span style={{
            fontFamily: fonts.body,
            fontSize: '16px',
            fontWeight: idx === 0 ? 600 : 400,
            color: idx === 0 ? colors.accent : colors.text,
            marginRight: '10px',
          }}>
            {outcome.name}
          </span>
          <span style={{
            fontFamily: fonts.heading,
            fontSize: '20px',
            fontWeight: 700,
            color: idx === 0 ? colors.accent : colors.text,
          }}>
            {formatPrice(outcome.price)}
          </span>
        </span>
      ))}

      {/* Separator dot */}
      <span style={{
        color: colors.border,
        fontSize: '10px',
        marginLeft: '20px',
      }}>
        ●
      </span>
    </span>
  );
}

export function Ticker({
  data,
  state = 'on',
  speed = 60, // seconds for one full scroll (slower for readability)
}) {
  const { colors, fonts } = useTheme();

  const animationStyles = {
    off: { transform: 'translateY(100%)', opacity: 0 },
    entering: {
      transform: 'translateY(0)',
      opacity: 1,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    on: { transform: 'translateY(0)', opacity: 1 },
    exiting: {
      transform: 'translateY(100%)',
      opacity: 0,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    },
  };

  if (state === 'off') return null;

  // Get events to display
  let events = [];
  if (data?.type === 'event' && data?.event) {
    // Single event assigned
    events = [data.event];
  } else if (data?.type === 'events' && data?.events) {
    // Multiple events
    events = data.events.filter(e => e && e.outcomes?.length > 0);
  }

  // If no events, show nothing
  if (events.length === 0) {
    return (
      <div
        style={{
          gridArea: 'ticker',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.surface,
          overflow: 'hidden',
          ...animationStyles[state],
        }}
      >
        <div style={{
          height: '4px',
          background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '56px',
          fontFamily: fonts.body,
          fontSize: '14px',
          color: colors.textMuted,
        }}>
          No events assigned to ticker
        </div>
      </div>
    );
  }

  // Duplicate events for seamless loop
  const displayEvents = [...events, ...events];

  return (
    <div
      style={{
        gridArea: 'ticker',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.surface,
        overflow: 'hidden',
        ...animationStyles[state],
      }}
    >
      {/* Gradient accent bar at top */}
      <div style={{
        height: '4px',
        background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        overflow: 'hidden',
      }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            paddingLeft: '24px',
            animation: `ticker-scroll ${speed}s linear infinite`,
            willChange: 'transform',
            flexShrink: 0,
          }}
        >
          {displayEvents.map((event, index) => (
            <EventSection
              key={`${event.id}-${index}`}
              event={event}
              fonts={fonts}
              colors={colors}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default Ticker;
