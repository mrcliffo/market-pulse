/**
 * Main content zone - Featured market + secondary markets grid
 */

import { useTheme } from '../../themes/index.jsx';
import { FeaturedMarket } from '../content/FeaturedMarket.jsx';
import { SecondaryMarkets } from '../content/SecondaryMarkets.jsx';
import { EventGroup } from '../content/EventGroup.jsx';

export function Main({
  content,
  data,
  state = 'on',
}) {
  const { colors, fonts } = useTheme();

  const animationStyles = {
    off: { transform: 'translateX(-100%)', opacity: 0 },
    entering: {
      transform: 'translateX(0)',
      opacity: 1,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    on: { transform: 'translateX(0)', opacity: 1 },
    exiting: {
      transform: 'translateX(-100%)',
      opacity: 0,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    },
  };

  if (state === 'off') return null;

  // New layout: featured + secondary markets
  // data shape: { featured: event, secondary: [event, event, event], trending: [...] }
  const hasFeaturedLayout = data?.featured || data?.secondary || data?.trending;

  if (hasFeaturedLayout) {
    return (
      <div
        style={{
          gridArea: 'main',
          padding: '16px', // Uniform padding
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          ...animationStyles[state],
        }}
      >
        {/* Featured market - takes most of the space */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <FeaturedMarket
            event={data?.featured}
            trending={data?.trending}
            priceHistoryCache={data?.priceHistoryCache}
            maxOutcomes={6}
          />
        </div>

        {/* Secondary markets - 3 columns at bottom */}
        <div style={{ flexShrink: 0 }}>
          <SecondaryMarkets events={data?.secondary || []} maxCards={3} />
        </div>
      </div>
    );
  }

  // Legacy fallback: single event group display
  const isEvent = data?.outcomes && Array.isArray(data.outcomes) && data.outcomes[0]?.name;

  if (content?.type === 'eventGroup' || isEvent) {
    return (
      <div
        style={{
          gridArea: 'main',
          padding: '16px', // Uniform padding
          overflow: 'hidden',
          ...animationStyles[state],
        }}
      >
        <EventGroup event={data} maxOutcomes={10} />
      </div>
    );
  }

  // Empty state
  return (
    <div
      style={{
        gridArea: 'main',
        padding: '16px', // Uniform padding
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textMuted,
        fontFamily: fonts.body,
        ...animationStyles[state],
      }}
    >
      No content assigned
    </div>
  );
}

export default Main;
