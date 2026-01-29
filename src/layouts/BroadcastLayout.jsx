/**
 * Broadcast layout - 6-zone CSS Grid at 1920x1080
 */

import { useTheme } from '../themes/index.jsx';
import { Header, Main, Sidebar, LowerThird, BottomCorner, Ticker } from '../components/zones/index.js';

export function BroadcastLayout({
  zones,
  data,
  config,
  flipped = false,
}) {
  const { colors, fonts } = useTheme();

  const gridAreas = flipped
    ? `"header header"
       "sidebar main"
       "bottomcorner lowerthird"
       "ticker ticker"`
    : `"header header"
       "main sidebar"
       "lowerthird bottomcorner"
       "ticker ticker"`;

  const gridColumns = flipped ? '360px 1fr' : '1fr 360px';

  // Add debug background for testing (remove for production OBS use)
  const isDebug = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('debug') === 'true';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateAreas: gridAreas,
        gridTemplateColumns: gridColumns,
        gridTemplateRows: '90px 1fr auto 64px',
        width: '1920px',
        height: '1080px',
        backgroundColor: isDebug ? '#0a0a0f' : 'transparent',
        fontFamily: fonts.body,
        overflow: 'hidden',
      }}
    >
      <Header
        siteName={config?.siteName}
        logoUrl={config?.logoUrl}
        countdown={config?.countdown}
        state={zones?.header?.visible ? 'on' : 'off'}
      />

      <Main
        content={zones?.main?.content}
        data={data?.main}
        state={zones?.main?.visible ? 'on' : 'off'}
      />

      <Sidebar
        content={zones?.sidebar?.content}
        data={data?.sidebar}
        bigMovers={data?.bigMovers}
        state={zones?.sidebar?.visible ? 'on' : 'off'}
      />

      <LowerThird
        content={zones?.lowerThird?.content}
        data={data?.lowerThird}
        state={zones?.lowerThird?.visible ? 'on' : 'off'}
      />

      <BottomCorner
        voteUrl={config?.voteUrl}
        state={zones?.bottomCorner?.visible ? 'on' : 'off'}
      />

      <Ticker
        data={data?.ticker}
        state={zones?.ticker?.visible ? 'on' : 'off'}
      />
    </div>
  );
}

export default BroadcastLayout;
