/**
 * Lower third zone - Editorial content display
 * Content switches instantly without fade animation
 */

import { useTheme } from '../../themes/index.jsx';
import { EditorialCard } from '../content/EditorialCard.jsx';

export function LowerThird({
  content,
  data,
  state = 'on',
  portrait = false,
}) {
  const { colors } = useTheme();

  const animationStyles = {
    off: { transform: 'translateY(100%)', opacity: 0 },
    entering: {
      transform: 'translateY(0)',
      opacity: 1,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    on: { transform: 'translateY(0)', opacity: 1 },
    exiting: {
      transform: 'translateY(100%)',
      opacity: 0,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    },
  };

  if (state === 'off') return null;

  return (
    <div
      style={{
        gridArea: portrait ? undefined : 'lowerthird',
        padding: portrait ? '0' : '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...animationStyles[state],
      }}
    >
      {data && <EditorialCard market={data} portrait={portrait} />}
    </div>
  );
}

export default LowerThird;
