/**
 * GET /api/markets
 * Returns all filtered markets in normalized format
 */

import { getProvider } from '../lib/providers/index.js';
import { getFilterConfig, getConfig } from '../lib/config.js';
import { prefetchSparklines } from '../lib/providers/polymarket.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const provider = getProvider();
    const filters = getFilterConfig();
    const config = getConfig();

    // Fetch markets from provider
    let markets = await provider.fetchMarkets(filters);

    // Only pre-fetch sparklines if explicitly requested (avoid rate limiting)
    if (req.query.sparklines === 'true') {
      markets = await prefetchSparklines(markets);
    }

    // Sort by volume (default)
    markets.sort((a, b) => b.volume - a.volume);

    return res.status(200).json({
      markets,
      meta: {
        provider: provider.id,
        category: config.category,
        filters: config.eventFilters,
        blacklist: config.blacklist,
        count: markets.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Markets API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch markets',
      message: error.message,
    });
  }
}
