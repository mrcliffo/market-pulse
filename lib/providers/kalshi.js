/**
 * Kalshi provider adapter
 * Implements the MarketProvider interface for Kalshi API
 */

import { normalizeKalshiMarket, filterMarkets } from '../transformers.js';
import { getConfig } from '../config.js';

const DEFAULT_API_URL = 'https://api.elections.kalshi.com/trade-api/v2';

// In-memory cache
let marketCache = { data: null, timestamp: 0 };
let allMarketsCache = { data: null, timestamp: 0 };
let priceHistoryCache = new Map();
const MARKET_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for filtered markets
const ALL_MARKETS_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours for all markets
const PRICE_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours for price history

/**
 * Fetch with error handling and timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout: ${url}`);
    }
    throw error;
  }
}

/**
 * Get base URL from config
 */
function getBaseUrl() {
  const config = getConfig();
  return config.providerUrls.kalshi?.api || DEFAULT_API_URL;
}

/**
 * Fetch all events with nested markets from Kalshi
 * @param {string} status - Event status filter ('open', 'closed', 'settled')
 */
async function fetchEvents(status = 'open') {
  const baseUrl = getBaseUrl();
  const allEvents = [];
  let cursor = '';

  // Paginate through all results
  do {
    const params = new URLSearchParams({
      status,
      with_nested_markets: 'true',
      limit: '200',
    });
    if (cursor) {
      params.set('cursor', cursor);
    }

    const url = `${baseUrl}/events?${params}`;
    const response = await fetchWithTimeout(url);

    if (response.events) {
      allEvents.push(...response.events);
    }

    cursor = response.cursor || '';
  } while (cursor);

  return allEvents;
}

/**
 * Fetch a single event by ticker
 */
async function fetchEventByTicker(eventTicker) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/events/${encodeURIComponent(eventTicker)}?with_nested_markets=true`;

  try {
    const response = await fetchWithTimeout(url);
    return response.event || null;
  } catch (error) {
    console.error(`Failed to fetch event ${eventTicker}:`, error);
    return null;
  }
}

/**
 * Kalshi provider implementation
 */
export const kalshiProvider = {
  id: 'kalshi',

  /**
   * Fetch all markets matching filters
   */
  async fetchMarkets(filters) {
    // Check cache
    const now = Date.now();
    if (marketCache.data && (now - marketCache.timestamp) < MARKET_CACHE_TTL) {
      return filterMarkets(marketCache.data, filters);
    }

    try {
      // Fetch all open events with nested markets
      const events = await fetchEvents('open');

      // Filter events by configured terms
      const matchingEvents = events.filter(event => {
        const title = (event.title || '').toLowerCase();

        // Check event filters
        const matchesFilter = filters.eventFilters.length === 0 ||
          filters.eventFilters.some(term => title.includes(term.toLowerCase()));

        // Check blacklist
        const matchesBlacklist = filters.blacklist.some(term =>
          title.includes(term.toLowerCase())
        );

        return matchesFilter && !matchesBlacklist;
      });

      // Extract and normalize markets from events
      const allMarkets = [];
      for (const event of matchingEvents) {
        const eventMarkets = event.markets || [];
        for (const market of eventMarkets) {
          try {
            const normalized = normalizeKalshiMarket(market, event);
            allMarkets.push(normalized);
          } catch (error) {
            console.error(`Failed to normalize Kalshi market ${market.ticker}:`, error);
          }
        }
      }

      // Update cache
      marketCache = { data: allMarkets, timestamp: now };

      return filterMarkets(allMarkets, filters);
    } catch (error) {
      console.error('Failed to fetch Kalshi data:', error);

      // Return cached data if available
      if (marketCache.data) {
        console.log('Returning cached Kalshi market data');
        return filterMarkets(marketCache.data, filters);
      }

      throw error;
    }
  },

  /**
   * Fetch ALL markets without filtering (for control page discovery)
   */
  async fetchAllMarkets() {
    const now = Date.now();

    // Check all-markets cache
    if (allMarketsCache.data && (now - allMarketsCache.timestamp) < ALL_MARKETS_CACHE_TTL) {
      console.log(`Returning ${allMarketsCache.data.length} Kalshi markets from cache`);
      return allMarketsCache.data;
    }

    try {
      // Fetch all open events (no filtering)
      const events = await fetchEvents('open');

      // Extract all markets from all events
      const allMarkets = [];
      for (const event of events) {
        const eventMarkets = event.markets || [];
        for (const market of eventMarkets) {
          try {
            const normalized = normalizeKalshiMarket(market, event);
            allMarkets.push(normalized);
          } catch (error) {
            console.error(`Failed to normalize Kalshi market ${market.ticker}:`, error);
          }
        }
      }

      // Update cache
      allMarketsCache = { data: allMarkets, timestamp: now };
      console.log(`Cached ${allMarkets.length} Kalshi markets for discovery`);

      return allMarkets;
    } catch (error) {
      console.error('Failed to fetch all Kalshi data:', error);

      // Return cached data if available
      if (allMarketsCache.data) {
        console.log('Returning stale Kalshi all-markets cache');
        return allMarketsCache.data;
      }

      throw error;
    }
  },

  /**
   * Fetch price history for sparklines
   * @param {string} ticker - Market ticker
   * @param {string} interval - Time interval ('1d', '1w', '1m')
   * @param {string} seriesTicker - Series ticker (required for Kalshi candlesticks)
   */
  async fetchPriceHistory(ticker, interval = '1w', seriesTicker = null) {
    const cacheKey = `${ticker}-${interval}`;
    const now = Date.now();

    // Check cache
    const cached = priceHistoryCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < PRICE_CACHE_TTL) {
      return cached.data;
    }

    // If no series ticker provided, we can't fetch candlesticks
    if (!seriesTicker) {
      console.warn(`No series_ticker provided for Kalshi market ${ticker}, skipping price history`);
      return [];
    }

    const baseUrl = getBaseUrl();

    // Map interval to Kalshi period_interval
    const intervalMap = {
      '1d': { periodInterval: 60, days: 1 },      // Hourly for 1 day
      '1w': { periodInterval: 60, days: 7 },      // Hourly for 1 week
      '1m': { periodInterval: 1440, days: 30 },   // Daily for 1 month
    };

    const params = intervalMap[interval] || intervalMap['1w'];
    const endTs = Math.floor(now / 1000);
    const startTs = endTs - (params.days * 24 * 60 * 60);

    const url = `${baseUrl}/series/${encodeURIComponent(seriesTicker)}/markets/${encodeURIComponent(ticker)}/candlesticks?start_ts=${startTs}&end_ts=${endTs}&period_interval=${params.periodInterval}`;

    try {
      const data = await fetchWithTimeout(url);

      // Transform to standard format
      const history = (data.candlesticks || []).map(candle => ({
        t: candle.end_period_ts,
        p: parseKalshiPrice(candle.price?.close_dollars || candle.price?.close_cents),
      })).filter(point => point.p !== null);

      // Cache result
      priceHistoryCache.set(cacheKey, { data: history, timestamp: now });

      return history;
    } catch (error) {
      console.error(`Failed to fetch Kalshi price history for ${ticker}:`, error);

      // Return cached data if available
      if (cached) return cached.data;

      return [];
    }
  },

  /**
   * Get market URL for deep linking
   */
  getMarketUrl(market) {
    // Kalshi market URLs use the event ticker
    const eventTicker = market.event?.id || market.slug;
    return `https://kalshi.com/markets/${eventTicker}`;
  },

  /**
   * Get outcome-specific URL
   */
  getOutcomeUrl(market, outcomeIndex = 0) {
    return this.getMarketUrl(market);
  },

  /**
   * Check if market is resolved
   */
  async checkResolution(market) {
    try {
      // Market ticker should be stored in the market object
      const ticker = market.id;
      if (!ticker) {
        return { resolved: market.resolved };
      }

      // Fetch fresh event data
      const eventTicker = market.event?.id;
      if (!eventTicker) {
        return { resolved: market.resolved };
      }

      const event = await fetchEventByTicker(eventTicker);
      if (!event || !event.markets) {
        return { resolved: market.resolved };
      }

      // Find this market in the event
      const freshMarket = event.markets.find(m => m.ticker === ticker);
      if (!freshMarket) {
        return { resolved: market.resolved };
      }

      // Check Kalshi market status
      const resolvedStatuses = ['determined', 'finalized', 'settled'];
      const isResolved = resolvedStatuses.includes(freshMarket.status);

      return {
        resolved: isResolved,
        outcome: freshMarket.result || null,
        resolvedAt: null, // Kalshi doesn't provide this directly
      };
    } catch (error) {
      console.error(`Failed to check Kalshi resolution for ${market.id}:`, error);
      return { resolved: market.resolved };
    }
  },
};

/**
 * Parse Kalshi fixed-point price to decimal
 * @param {string|number} price - Price in dollars (string like "0.5600") or cents (integer)
 * @returns {number} - Price as decimal 0-1
 */
function parseKalshiPrice(price) {
  if (price === null || price === undefined) return null;

  // If it's a string (dollars format like "0.5600")
  if (typeof price === 'string') {
    return parseFloat(price) || 0;
  }

  // If it's a number (cents), convert to dollars
  if (typeof price === 'number') {
    return price / 100;
  }

  return 0;
}

export default kalshiProvider;
