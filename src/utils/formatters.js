/**
 * Client-side formatting utilities
 */

/**
 * Format price as percentage
 * @param {number} price - Price as decimal (0.32)
 * @returns {string} - Formatted percentage ("32%")
 */
export function formatPrice(price) {
  const pct = (parseFloat(price) * 100).toFixed(1);
  return pct.replace(/\.0$/, '') + '%';
}

/**
 * Format change as signed percentage
 * @param {number} change - Change as decimal (0.05 or -0.02)
 * @returns {string} - Formatted signed percentage ("+5.0%" or "-2.0%")
 */
export function formatChange(change) {
  const pct = (parseFloat(change) * 100).toFixed(1);
  return change >= 0 ? '+' + pct + '%' : pct + '%';
}

/**
 * Format volume as abbreviated currency
 * @param {number} volume - Volume in USD
 * @returns {string} - Formatted volume ("$2.4M", "$350K", "$500")
 */
export function formatVolume(volume) {
  const num = parseFloat(volume) || 0;
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
  return '$' + num.toFixed(0);
}

/**
 * Get directional arrow
 * @param {number} change - Change value
 * @returns {string} - Arrow character
 */
export function getArrow(change) {
  return change >= 0 ? '▲' : '▼';
}

/**
 * Get color class based on change direction
 * @param {number} change - Change value
 * @param {object} colors - Theme colors object
 * @returns {string} - Color value
 */
export function getChangeColor(change, colors) {
  if (change > 0.001) return colors.positive;
  if (change < -0.001) return colors.negative;
  return colors.textMuted;
}

/**
 * Format multiplier (potential payout)
 * @param {number} price - Price as decimal
 * @returns {string} - Formatted multiplier ("12.5x")
 */
export function formatMultiplier(price) {
  if (price <= 0) return '∞';
  return (1 / price).toFixed(1) + 'x';
}

/**
 * Calculate potential payout
 * @param {number} priceAtVote - Price when vote was cast (decimal)
 * @param {number} betAmount - Hypothetical bet amount (default $100)
 * @returns {string} - Formatted payout amount
 */
export function calculatePayout(priceAtVote, betAmount = 100) {
  if (priceAtVote <= 0) return '∞';
  return (betAmount / priceAtVote).toFixed(2);
}

/**
 * Format countdown time
 * @param {Date|string} targetDate - Target date
 * @returns {object} - Countdown parts { days, hours, minutes, seconds }
 */
export function formatCountdown(targetDate) {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: diff };
}

/**
 * Format relative time
 * @param {Date|string} date - Date to format
 * @returns {string} - Relative time string ("2h ago", "3d ago")
 */
export function formatRelativeTime(date) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
