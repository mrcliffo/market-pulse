/**
 * Countdown timer display
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../themes/index.jsx';
import { formatCountdown } from '../../utils/formatters.js';

export function Countdown({ targetDate, label }) {
  const { colors, fonts } = useTheme();
  const [time, setTime] = useState(formatCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatCountdown(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.total <= 0) {
    return null;
  }

  const TimeBlock = ({ value, unit }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '48px',
    }}>
      <span style={{
        fontFamily: fonts.heading,
        fontSize: '28px',
        fontWeight: 700,
        color: colors.text,
        lineHeight: 1,
      }}>
        {String(value).padStart(2, '0')}
      </span>
      <span style={{
        fontFamily: fonts.body,
        fontSize: '11px',
        fontWeight: 500,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        {unit}
      </span>
    </div>
  );

  const Separator = () => (
    <span style={{
      fontFamily: fonts.heading,
      fontSize: '24px',
      fontWeight: 600,
      color: colors.textMuted,
      margin: '0 4px',
      alignSelf: 'flex-start',
    }}>
      :
    </span>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
    }}>
      {label && (
        <span style={{
          fontFamily: fonts.heading,
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '2px',
          color: colors.accent,
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '4px',
      }}>
        <TimeBlock value={time.days} unit="Days" />
        <Separator />
        <TimeBlock value={time.hours} unit="Hrs" />
        <Separator />
        <TimeBlock value={time.minutes} unit="Min" />
        <Separator />
        <TimeBlock value={time.seconds} unit="Sec" />
      </div>
    </div>
  );
}

export default Countdown;
