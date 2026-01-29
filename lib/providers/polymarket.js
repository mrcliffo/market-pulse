/**
 * Polymarket provider adapter
 * Implements the MarketProvider interface for Polymarket API
 */

import { normalizePolymarketMarket, filterMarkets } from '../transformers.js';
import { getConfig } from '../config.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const GAMMA_BASE_URL = 'https://gamma-api.polymarket.com';
const CLOB_BASE_URL = 'https://clob.polymarket.com';

// File-based cache for persistence across restarts
const CACHE_FILE = join(process.cwd(), '.cache', 'markets.json');

// In-memory cache
let marketCache = { data: null, timestamp: 0 };
let allMarketsCache = { data: null, timestamp: 0 }; // Separate cache for all markets (unfiltered)
let priceHistoryCache = new Map();
const MARKET_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for filtered markets
const ALL_MARKETS_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours for all markets (discovery/selection)
const PRICE_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours - sparklines don't need frequent updates

// Load cache from file on startup
try {
  if (existsSync(CACHE_FILE)) {
    const cached = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
    if (cached.data && cached.timestamp) {
      marketCache = cached;
      console.log(`Loaded ${cached.data.length} markets from cache (age: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);
    }
  }
} catch (e) {
  console.log('No cache file found, starting fresh');
}

// Save cache to file
function saveCache() {
  try {
    const dir = join(process.cwd(), '.cache');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(CACHE_FILE, JSON.stringify(marketCache));
    console.log('Cache saved to disk');
  } catch (e) {
    // Ignore cache save errors
  }
}

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
 * Fetch all active events from Polymarket
 */
async function fetchActiveEvents() {
  const config = getConfig();
  const baseUrl = config.providerUrls.polymarket.gamma || GAMMA_BASE_URL;

  const url = `${baseUrl}/events?active=true&closed=false&limit=200`;
  const events = await fetchWithTimeout(url);

  return events;
}

/**
 * Fetch event details by slug
 */
async function fetchEventBySlug(slug) {
  const config = getConfig();
  const baseUrl = config.providerUrls.polymarket.gamma || GAMMA_BASE_URL;

  const url = `${baseUrl}/events?slug=${encodeURIComponent(slug)}`;
  const events = await fetchWithTimeout(url);

  return events[0] || null;
}

/**
 * Fetch markets for a specific event
 */
async function fetchEventMarkets(eventSlug) {
  const config = getConfig();
  const baseUrl = config.providerUrls.polymarket.gamma || GAMMA_BASE_URL;

  const url = `${baseUrl}/markets?event_slug=${encodeURIComponent(eventSlug)}`;
  const markets = await fetchWithTimeout(url);

  return markets;
}

/**
 * Polymarket provider implementation
 */
export const polymarketProvider = {
  id: 'polymarket',

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
      // 1. Fetch all active events
      const events = await fetchActiveEvents();

      // 2. Filter events by configured terms
      const matchingEvents = events.filter(event => {
        const title = event.title.toLowerCase();

        // Check event filters
        const matchesFilter = filters.eventFilters.length === 0 ||
          filters.eventFilters.some(term => title.includes(term.toLowerCase()));

        // Check blacklist
        const matchesBlacklist = filters.blacklist.some(term =>
          title.includes(term.toLowerCase())
        );

        return matchesFilter && !matchesBlacklist;
      });

      // 3. Extract markets from events (they're already included in the response)
      const allMarkets = [];
      for (const event of matchingEvents) {
        // Markets are nested in the event response
        const eventMarkets = event.markets || [];
        for (const market of eventMarkets) {
          try {
            const normalized = normalizePolymarketMarket(market, event);
            allMarkets.push(normalized);
          } catch (error) {
            console.error(`Failed to normalize market ${market.slug}:`, error);
          }
        }
      }

      // Update cache
      marketCache = { data: allMarkets, timestamp: now };
      saveCache();

      return filterMarkets(allMarkets, filters);
    } catch (error) {
      console.error('Failed to fetch Polymarket data:', error);

      // Return cached data if available
      if (marketCache.data) {
        console.log('Returning cached market data');
        return filterMarkets(marketCache.data, filters);
      }

      throw error;
    }
  },

  /**
   * Fetch ALL markets without filtering (for control page discovery)
   * Uses longer cache TTL (4 hours) since this is for selection, not live display
   */
  async fetchAllMarkets() {
    const now = Date.now();

    // Check all-markets cache (4 hour TTL)
    if (allMarketsCache.data && (now - allMarketsCache.timestamp) < ALL_MARKETS_CACHE_TTL) {
      console.log(`Returning ${allMarketsCache.data.length} markets from all-markets cache (age: ${Math.round((now - allMarketsCache.timestamp) / 1000)}s)`);
      return allMarketsCache.data;
    }

    try {
      // Fetch all active events (no filtering)
      const events = await fetchActiveEvents();

      // Extract all markets from all events
      const allMarkets = [];
      for (const event of events) {
        const eventMarkets = event.markets || [];
        for (const market of eventMarkets) {
          try {
            const normalized = normalizePolymarketMarket(market, event);
            allMarkets.push(normalized);
          } catch (error) {
            console.error(`Failed to normalize market ${market.slug}:`, error);
          }
        }
      }

      // Update all-markets cache
      allMarketsCache = { data: allMarkets, timestamp: now };
      console.log(`Cached ${allMarkets.length} markets for all-markets discovery`);

      return allMarkets;
    } catch (error) {
      console.error('Failed to fetch all Polymarket data:', error);

      // Return cached data if available
      if (allMarketsCache.data) {
        console.log('Returning stale all-markets cache');
        return allMarketsCache.data;
      }

      throw error;
    }
  },

  /**
   * Fetch price history for sparklines
   */
  async fetchPriceHistory(tokenId, interval = '1w') {
    const cacheKey = `${tokenId}-${interval}`;
    const now = Date.now();

    // Check cache
    const cached = priceHistoryCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < PRICE_CACHE_TTL) {
      return cached.data;
    }

    const config = getConfig();
    const baseUrl = config.providerUrls.polymarket.clob || CLOB_BASE_URL;

    // Map interval to API parameters
    const intervalMap = {
      '1d': { interval: 'max', fidelity: 60 },
      '1w': { interval: 'max', fidelity: 360 },
      '1m': { interval: 'max', fidelity: 720 },
    };

    const params = intervalMap[interval] || intervalMap['1w'];
    const url = `${baseUrl}/prices-history?market=${tokenId}&interval=${params.interval}&fidelity=${params.fidelity}`;

    try {
      const data = await fetchWithTimeout(url);

      // Transform to standard format
      const history = (data.history || []).map(point => ({
        t: point.t,
        p: parseFloat(point.p) || 0,
      }));

      // Cache result
      priceHistoryCache.set(cacheKey, { data: history, timestamp: now });

      return history;
    } catch (error) {
      console.error(`Failed to fetch price history for ${tokenId}:`, error);

      // Return cached data if available
      if (cached) return cached.data;

      return [];
    }
  },

  /**
   * Get market URL for deep linking
   */
  getMarketUrl(market) {
    return `https://polymarket.com/event/${market.slug}`;
  },

  /**
   * Get outcome-specific URL
   */
  getOutcomeUrl(market, outcomeIndex = 0) {
    return `https://polymarket.com/event/${market.slug}`;
  },

  /**
   * Check if market is resolved
   */
  async checkResolution(market) {
    try {
      const event = await fetchEventBySlug(market.slug);
      if (!event) {
        return { resolved: false };
      }

      return {
        resolved: event.closed || false,
        outcome: event.resolution || null,
        resolvedAt: event.resolvedAt || null,
      };
    } catch (error) {
      console.error(`Failed to check resolution for ${market.slug}:`, error);
      return { resolved: market.resolved };
    }
  },
};

/**
 * Pre-fetch sparkline data for all markets
 */
export async function prefetchSparklines(markets) {
  const promises = markets.map(async market => {
    const tokenId = market.tokenIds[0];
    if (!tokenId) return market;

    try {
      const sparkline = await polymarketProvider.fetchPriceHistory(tokenId, '1w');
      return {
        ...market,
        outcomes: market.outcomes.map((outcome, i) => ({
          ...outcome,
          sparkline: i === 0 ? sparkline : null,
        })),
      };
    } catch {
      return market;
    }
  });

  return Promise.all(promises);
}

export default polymarketProvider;
