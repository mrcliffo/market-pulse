/**
 * All outcomes for one event - broadcast-ready display
 */

import { useTheme } from '../../themes/index.jsx';
import { formatPrice, formatVolume } from '../../utils/formatters.js';

function OutcomeRow({ outcome, rank, isLeader, fonts, colors }) {
  const percentage = Math.round((outcome.price || 0) * 100);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 16px',
      backgroundColor: isLeader ? colors.surfaceAlt : 'transparent',
      borderRadius: '8px',
      marginBottom: '6px',
      borderLeft: isLeader ? `4px solid ${colors.accent}` : '4px solid transparent',
    }}>
      {/* Rank */}
      <div style={{
        fontFamily: fonts.heading,
        fontSize: '20px',
        fontWeight: 600,
        color: isLeader ? colors.accent : colors.textMuted,
        width: '28px',
        textAlign: 'center',
      }}>
        {rank}
      </div>

      {/* Name */}
      <div style={{
        flex: 1,
        fontFamily: fonts.body,
        fontSize: '18px',
        fontWeight: isLeader ? 700 : 400,
        color: isLeader ? colors.text : colors.text,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {outcome.name}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '120px',
        height: '8px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: isLeader
            ? `linear-gradient(90deg, ${colors.accent}, ${colors.secondary})`
            : colors.primary,
          borderRadius: '4px',
          transition: 'width 0.5s ease-out',
        }} />
      </div>

      {/* Price */}
      <div style={{
        fontFamily: fonts.heading,
        fontSize: '24px',
        fontWeight: 700,
        color: isLeader ? colors.accent : colors.text,
        width: '70px',
        textAlign: 'right',
      }}>
        {formatPrice(outcome.price || 0)}
      </div>
    </div>
  );
}

export function EventGroup({
  event,
  maxOutcomes = 8,
  showVolume = true,
  compact = false,
}) {
  const { colors, fonts } = useTheme();

  if (!event) return null;

  const outcomes = (event.outcomes || []).slice(0, maxOutcomes);
  const hasMore = (event.outcomes?.length || 0) > maxOutcomes;
  const leader = outcomes[0];

  return (
    <div style={{
      backgroundColor: colors.surface,
      borderRadius: '12px',
      padding: compact ? '16px' : '24px',
      border: `1px solid ${colors.border}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Event Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `2px solid ${colors.border}`,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: compact ? '24px' : '32px',
            fontWeight: 600,
            letterSpacing: '1px',
            color: colors.text,
            lineHeight: 1.1,
            textTransform: 'uppercase',
          }}>
            {event.title}
          </div>
          <div style={{
            fontFamily: fonts.body,
            fontSize: '14px',
            color: colors.textMuted,
            marginTop: '8px',
          }}>
            {outcomes.length} outcomes
            {showVolume && event.totalVolume > 0 && ` · ${formatVolume(event.totalVolume)} volume`}
          </div>
        </div>

        {/* Leader highlight */}
        {leader && !compact && (
          <div style={{
            textAlign: 'right',
            padding: '12px 16px',
            backgroundColor: colors.surfaceAlt,
            borderRadius: '8px',
            borderLeft: `4px solid ${colors.accent}`,
          }}>
            <div style={{
              fontFamily: fonts.heading,
              fontSize: '12px',
              fontWeight: 500,
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              LEADER
            </div>
            <div style={{
              fontFamily: fonts.body,
              fontSize: '16px',
              fontWeight: 600,
              color: colors.accent,
              marginTop: '4px',
            }}>
              {leader.name}
            </div>
            <div style={{
              fontFamily: fonts.heading,
              fontSize: '28px',
              fontWeight: 700,
              color: colors.text,
              marginTop: '2px',
            }}>
              {formatPrice(leader.price || 0)}
            </div>
          </div>
        )}
      </div>

      {/* Outcomes List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
      }}>
        {outcomes.map((outcome, index) => (
          <OutcomeRow
            key={outcome.slug || outcome.marketId || index}
            outcome={outcome}
            rank={index + 1}
            isLeader={index === 0}
            fonts={fonts}
            colors={colors}
          />
        ))}
      </div>

      {/* More indicator */}
      {hasMore && (
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: `1px solid ${colors.border}`,
          fontFamily: fonts.body,
          fontSize: '14px',
          color: colors.textMuted,
          textAlign: 'center',
        }}>
          +{(event.outcomes?.length || 0) - maxOutcomes} more outcomes
        </div>
      )}
    </div>
  );
}

export default EventGroup;
