/**
 * Bottom corner zone - Vote CTA with QR code
 * Aligns with lower third / editorial card
 */

import { useTheme } from '../../themes/index.jsx';
import { QRCode } from '../ui/QRCode.jsx';

export function BottomCorner({
  voteUrl,
  state = 'on',
}) {
  const { colors, fonts } = useTheme();

  const animationStyles = {
    off: { transform: 'translateX(100%)', opacity: 0 },
    entering: {
      transform: 'translateX(0)',
      opacity: 1,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    on: { transform: 'translateX(0)', opacity: 1 },
    exiting: {
      transform: 'translateX(100%)',
      opacity: 0,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    },
  };

  if (state === 'off') return null;

  return (
    <div
      style={{
        gridArea: 'bottomcorner',
        padding: '16px', // Uniform padding
        display: 'flex',
        flexDirection: 'column',
        ...animationStyles[state],
      }}
    >
      {/* Vote card */}
      <div style={{
        flex: 1,
        background: colors.surface,
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        border: `1px solid ${colors.border}`,
      }}>
        {/* QR Code */}
        {voteUrl && (
          <div style={{
            flexShrink: 0,
            padding: '12px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
          }}>
            <QRCode url={voteUrl} size={100} />
          </div>
        )}

        {/* Vote CTA */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: '24px',
            fontWeight: 600,
            color: colors.accent,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            VOTE NOW
          </div>
          <div style={{
            fontFamily: fonts.body,
            fontSize: '16px',
            color: colors.text,
            marginBottom: '4px',
          }}>
            Scan to cast your prediction
          </div>
          <div style={{
            fontFamily: fonts.body,
            fontSize: '13px',
            color: colors.textMuted,
          }}>
            Join thousands of fans voting live
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Portrait-specific QR component
 * Larger QR with centered layout and prominent CTA
 */
export function BottomCornerPortrait({
  voteUrl,
  state = 'on',
}) {
  const { colors, fonts } = useTheme();

  if (state === 'off') return null;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      {/* QR Code in white box */}
      {voteUrl && (
        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <QRCode url={voteUrl} size={140} />
          <div style={{
            fontFamily: fonts.heading,
            fontSize: '14px',
            fontWeight: 600,
            color: '#333333',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            VOTE NOW
          </div>
        </div>
      )}

      {/* Large CTA text */}
      <div style={{
        fontFamily: fonts.heading,
        fontSize: '28px',
        fontWeight: 700,
        color: colors.accent,
        letterSpacing: '3px',
        textTransform: 'uppercase',
      }}>
        VOTE NOW
      </div>
    </div>
  );
}

export default BottomCorner;
