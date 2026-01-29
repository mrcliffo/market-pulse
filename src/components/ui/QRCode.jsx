/**
 * QR Code component for vote link
 */

import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../../themes/index.jsx';

export function QRCode({
  url,
  size = 80,
  label = 'VOTE NOW',
  showLabel = true,
}) {
  const { colors } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div style={{
        padding: '8px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
      }}>
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>

      {showLabel && label && (
        <span style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '14px',
          letterSpacing: '0.1em',
          color: colors.accent,
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

export default QRCode;
