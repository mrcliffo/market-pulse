/**
 * Sidebar zone - Secondary content display
 * Default: Big Movers (24h biggest price changes)
 */

import { useTheme } from '../../themes/index.jsx';
import { MarketList } from '../content/MarketList.jsx';
import { EventGroup } from '../content/EventGroup.jsx';
import { BigMovers } from '../content/BigMovers.jsx';

export function Sidebar({
  content,
  data,
  bigMovers = [], // Playlist-based big movers for default view
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

  const renderContent = () => {
    // PRIORITY 1: If bigMovers has data, show BigMovers (default sidebar behavior)
    if (bigMovers && bigMovers.length > 0) {
      return <BigMovers movers={bigMovers} maxItems={6} />;
    }

    // PRIORITY 2: If explicit content type is assigned
    if (content?.type === 'eventGroup' && data) {
      return <EventGroup event={data} maxOutcomes={6} compact showVolume={false} />;
    }

    if (content?.type === 'marketList' && data) {
      return <MarketList markets={data} maxItems={6} title={content?.config?.title} />;
    }

    // PRIORITY 3: Infer from data shape
    const isEvent = data?.outcomes && Array.isArray(data.outcomes) && data.outcomes[0]?.name;
    const isMarketList = Array.isArray(data) && data[0]?.question;

    if (isEvent) {
      return <EventGroup event={data} maxOutcomes={6} compact showVolume={false} />;
    }

    if (isMarketList) {
      return <MarketList markets={data} maxItems={6} title={content?.config?.title} />;
    }

    // Fallback: Empty BigMovers
    return <BigMovers movers={[]} maxItems={6} />;
  };

  return (
    <div
      style={{
        gridArea: 'sidebar',
        display: 'flex',
        overflow: 'hidden',
        padding: '16px', // Uniform padding
        ...animationStyles[state],
      }}
    >
      {/* Sidebar content area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default Sidebar;
