/**
 * Mini sparkline chart for price history
 */

import { useMemo } from 'react';
import { useTheme } from '../../themes/index.jsx';

export function Sparkline({
  data = [],
  width = 120,
  height = 40,
  strokeWidth = 2,
  showFill = true,
}) {
  const { colors } = useTheme();

  const pathData = useMemo(() => {
    if (!data || data.length < 2) return { line: '', area: '' };

    const prices = data.map(d => d.p);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.p - minPrice) / range) * height;
      return { x, y };
    });

    // Create line path
    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Create area path (closed)
    const area = `${line} L ${width} ${height} L 0 ${height} Z`;

    return { line, area, points };
  }, [data, width, height]);

  // Determine color based on trend
  const trend = data.length >= 2
    ? data[data.length - 1].p - data[0].p
    : 0;

  const lineColor = trend >= 0 ? colors.positive : colors.negative;
  const fillColor = trend >= 0
    ? `${colors.positive}20`
    : `${colors.negative}20`;

  if (!data || data.length < 2) {
    return (
      <div style={{ width, height, opacity: 0.3 }}>
        <svg width={width} height={height}>
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={colors.textMuted}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
    );
  }

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {showFill && (
        <path
          d={pathData.area}
          fill={fillColor}
        />
      )}
      <path
        d={pathData.line}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Sparkline;
