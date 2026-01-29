/**
 * Portrait Broadcast layout - 6-zone CSS Grid at 1080x1920 (9:16)
 * Includes: Header, Main (trending + also trending), Secondary (2 cards), Lower Third + QR, Ticker
 * Auto-scales to fit viewport for preview while maintaining native dimensions for OBS
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../themes/index.jsx';
import { Header, Main, LowerThird, Ticker } from '../components/zones/index.js';
import { SecondaryMarkets } from '../components/content/SecondaryMarkets.jsx';
import { BottomCornerPortrait } from '../components/zones/BottomCorner.jsx';

const NATIVE_WIDTH = 1080;
const NATIVE_HEIGHT = 1920;

export function BroadcastLayoutPortrait({
  zones,
  data,
  config,
}) {
  const { colors, fonts } = useTheme();
  const [scale, setScale] = useState(1);

  // Calculate scale to fit viewport while maintaining aspect ratio
  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate scale to fit within viewport with some padding
      const scaleX = viewportWidth / NATIVE_WIDTH;
      const scaleY = viewportHeight / NATIVE_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1); // Never scale up, only down

      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Add debug background for testing (remove for production OBS use)
  const isDebug = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('debug') === 'true';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        width: `${NATIVE_WIDTH}px`,
        height: `${NATIVE_HEIGHT}px`,
        backgroundColor: isDebug ? '#0a0a0f' : 'transparent',
        fontFamily: fonts.body,
        overflow: 'hidden',
        boxSizing: 'border-box',
        // Auto-scale to fit viewport for preview, OBS captures native dimensions
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {/* Header - 100px */}
      <div style={{ flexShrink: 0, height: '100px' }}>
        <Header
          siteName={config?.siteName}
          logoUrl={config?.logoUrl}
          countdown={config?.countdown}
          state={zones?.header?.visible ? 'on' : 'off'}
          portrait={true}
        />
      </div>

      {/* Main - flex to fill space, ~820px */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Main
          content={zones?.main?.content}
          data={data?.main}
          state={zones?.main?.visible ? 'on' : 'off'}
          portrait={true}
        />
      </div>

      {/* Secondary markets - 340px, 2 cards side by side */}
      {zones?.main?.visible !== false && (
        <div style={{ flexShrink: 0, height: '340px' }}>
          <SecondaryMarkets
            events={data?.secondary || []}
            maxCards={2}
            portrait={true}
          />
        </div>
      )}

      {/* Lower Third + QR row - 320px */}
      <div style={{
        flexShrink: 0,
        height: '320px',
        display: 'flex',
        gap: '12px',
      }}>
        {/* Lower Third - takes remaining space */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <LowerThird
            content={zones?.lowerThird?.content}
            data={data?.lowerThird}
            state={zones?.lowerThird?.visible ? 'on' : 'off'}
            portrait={true}
          />
        </div>

        {/* QR Code - fixed width */}
        <div style={{ flexShrink: 0, width: '240px' }}>
          <BottomCornerPortrait
            voteUrl={config?.voteUrl}
            state={zones?.bottomCorner?.visible ? 'on' : 'off'}
          />
        </div>
      </div>

      {/* Ticker - 60px */}
      <div style={{ flexShrink: 0, height: '60px' }}>
        <Ticker
          data={data?.ticker}
          state={zones?.ticker?.visible ? 'on' : 'off'}
        />
      </div>
    </div>
  );
}

export default BroadcastLayoutPortrait;
