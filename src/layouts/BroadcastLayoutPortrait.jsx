/**
 * Portrait Broadcast layout - 6-zone CSS Grid at 1080x1920 (9:16)
 * Includes: Header, Main (trending + also trending), Secondary (2 cards), Lower Third + QR, Ticker
 * Auto-scales to fit viewport for preview while maintaining native dimensions for OBS
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../themes/index.jsx';
import { Header, Main, LowerThird, BottomCorner, Ticker } from '../components/zones/index.js';
import { SecondaryMarkets } from '../components/content/SecondaryMarkets.jsx';

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

  // Portrait layout grid:
  // - Header: 100px (compact header with logo, countdown)
  // - Main: 870px (featured market + also trending list)
  // - Secondary: 380px (2 event cards side by side)
  // - Lower Third + QR: 350px (editorial card + QR code)
  // - Ticker: 60px (scrolling markets)
  const gridAreas = `
    "header header"
    "main main"
    "secondary secondary"
    "lowerthird bottomcorner"
    "ticker ticker"
  `;

  // Add debug background for testing (remove for production OBS use)
  const isDebug = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('debug') === 'true';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateAreas: gridAreas,
        gridTemplateColumns: '1fr 280px',
        gridTemplateRows: '100px 870px 380px 350px 60px',
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
      <Header
        siteName={config?.siteName}
        logoUrl={config?.logoUrl}
        countdown={config?.countdown}
        state={zones?.header?.visible ? 'on' : 'off'}
        portrait={true}
      />

      <Main
        content={zones?.main?.content}
        data={data?.main}
        state={zones?.main?.visible ? 'on' : 'off'}
        portrait={true}
      />

      {/* Secondary markets - 2 cards side by side (tied to main zone visibility) */}
      {zones?.main?.visible !== false && (
        <div style={{ gridArea: 'secondary', overflow: 'hidden' }}>
          <SecondaryMarkets
            events={data?.secondary || []}
            maxCards={2}
            portrait={true}
          />
        </div>
      )}

      <LowerThird
        content={zones?.lowerThird?.content}
        data={data?.lowerThird}
        state={zones?.lowerThird?.visible ? 'on' : 'off'}
        portrait={true}
      />

      <BottomCorner
        voteUrl={config?.voteUrl}
        state={zones?.bottomCorner?.visible ? 'on' : 'off'}
        portrait={true}
      />

      <Ticker
        data={data?.ticker}
        state={zones?.ticker?.visible ? 'on' : 'off'}
      />
    </div>
  );
}

export default BroadcastLayoutPortrait;
