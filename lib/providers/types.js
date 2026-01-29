/**
 * TypeScript-style JSDoc type definitions for provider interfaces
 */

/**
 * @typedef {Object} FilterConfig
 * @property {string} category - Market category (sports, politics, crypto, entertainment)
 * @property {string[]} eventFilters - Terms to include
 * @property {string[]} blacklist - Terms to exclude
 * @property {boolean} activeOnly - Only non-closed markets
 * @property {number} [minVolume] - Minimum volume threshold
 * @property {number} [maxResolutionDays] - Max days until resolution
 */

/**
 * @typedef {Object} PricePoint
 * @property {number} t - Unix timestamp
 * @property {number} p - Price (0-1 decimal)
 */

/**
 * @typedef {Object} Outcome
 * @property {string} name - Outcome name (e.g., "Chiefs", "Yes")
 * @property {number} price - Price as decimal (0-1)
 * @property {number} change24h - 24-hour change (signed decimal)
 * @property {number} change7d - 7-day change (signed decimal)
 * @property {string} [tokenId] - Provider-specific token ID
 * @property {PricePoint[]} [sparkline] - Price history for sparkline
 */

/**
 * @typedef {Object} NormalizedMarket
 * @property {string} id - Provider's market ID
 * @property {string} slug - URL-safe identifier
 * @property {string} question - Full market question
 * @property {Outcome[]} outcomes - Market outcomes
 * @property {number} volume - Total volume (USD)
 * @property {number} volume24h - 24-hour volume (USD)
 * @property {number} liquidity - Current liquidity (USD)
 * @property {Object} event - Parent event info
 * @property {string} event.id - Event ID
 * @property {string} event.title - Event title
 * @property {string} event.category - Event category
 * @property {string[]} tokenIds - Provider-specific token IDs
 * @property {string} providerUrl - Direct link to market
 * @property {boolean} resolved - Whether market is resolved
 * @property {string} [resolution] - Resolution outcome
 * @property {string} [resolvedAt] - Resolution timestamp
 * @property {string} createdAt - Creation timestamp
 * @property {string} [resolvesAt] - Expected resolution timestamp
 */

/**
 * @typedef {Object} ResolutionStatus
 * @property {boolean} resolved - Whether market is resolved
 * @property {string} [outcome] - Resolution outcome
 * @property {string} [resolvedAt] - Resolution timestamp
 */

/**
 * @typedef {Object} MarketProvider
 * @property {string} id - Provider identifier
 * @property {function(FilterConfig): Promise<NormalizedMarket[]>} fetchMarkets - Fetch filtered markets
 * @property {function(string, string): Promise<PricePoint[]>} fetchPriceHistory - Fetch price history
 * @property {function(NormalizedMarket): string} getMarketUrl - Get market URL
 * @property {function(NormalizedMarket, number): string} getOutcomeUrl - Get outcome URL
 * @property {function(NormalizedMarket): Promise<ResolutionStatus>} checkResolution - Check resolution
 */

export {};
