/**
 * Pulsing live indicator dot
 */

import { useTheme } from '../../themes/index.jsx';

export function LiveIndicator({ size = 14, label = 'LIVE' }) {
  const { colors, fonts } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 16px',
      backgroundColor: 'rgba(255, 71, 87, 0.15)',
      borderRadius: '6px',
      border: `1px solid ${colors.negative}`,
    }}>
      <div style={{
        position: 'relative',
        width: size,
        height: size,
      }}>
        {/* Pulsing ring */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: colors.negative,
          animation: 'pulse 2s infinite',
        }} />

        {/* Solid core */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          backgroundColor: colors.negative,
        }} />
      </div>

      {label && (
        <span style={{
          fontFamily: fonts.heading,
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '2px',
          color: colors.negative,
        }}>
          {label}
        </span>
      )}

      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default LiveIndicator;
