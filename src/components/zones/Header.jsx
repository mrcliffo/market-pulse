/**
 * Header zone - Logo, live indicator, countdown
 */

import { useTheme } from '../../themes/index.jsx';
import { LiveIndicator } from '../ui/LiveIndicator.jsx';
import { Countdown } from '../ui/Countdown.jsx';

export function Header({
  siteName = 'MARKET PULSE',
  logoUrl,
  countdown,
  state = 'on',
}) {
  const { colors, fonts } = useTheme();

  const animationStyles = {
    off: { transform: 'translateY(-100%)', opacity: 0 },
    entering: {
      transform: 'translateY(0)',
      opacity: 1,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    on: { transform: 'translateY(0)', opacity: 1 },
    exiting: {
      transform: 'translateY(-100%)',
      opacity: 0,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    },
  };

  if (state === 'off') return null;

  return (
    <div
      style={{
        gridArea: 'header',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.surface,
        ...animationStyles[state],
      }}
    >
      {/* Main header content */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 32px',
        flex: 1,
      }}>
        {/* Logo / Site Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              style={{ height: '56px', width: 'auto' }}
            />
          ) : (
            <span style={{
              fontFamily: fonts.heading,
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '3px',
              color: colors.text,
              textTransform: 'uppercase',
            }}>
              {siteName}
            </span>
          )}
        </div>

        {/* Live Indicator + Countdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
        }}>
          {countdown?.date && (
            <Countdown
              targetDate={countdown.date}
              label={countdown.label}
            />
          )}
          <LiveIndicator />
        </div>
      </div>

      {/* Gradient accent bar */}
      <div style={{
        height: '4px',
        background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
      }} />
    </div>
  );
}

export default Header;
