/**
 * GET /api/events
 * Returns markets grouped by event
 *
 * Query params:
 *   ?all=true  - Fetch ALL markets (unfiltered) for control page discovery
 *                Uses 4-hour cache since it's for selection, not live display
 */

import { getProvider } from '../lib/providers/index.js';
import { getFilterConfig, getConfig } from '../lib/config.js';
import { groupMarketsByEvent } from '../lib/transformers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const provider = getProvider();
    const config = getConfig();
    const fetchAll = req.query.all === 'true';

    let markets;

    if (fetchAll) {
      // Fetch ALL markets without filtering (for control page discovery)
      // Uses 4-hour cache in the provider
      markets = await provider.fetchAllMarkets();

      // Set cache headers for all-markets endpoint (can be cached by CDN/browser)
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=14400'); // 1hr browser, 4hr CDN
    } else {
      // Fetch filtered markets (default behavior)
      const filters = getFilterConfig();
      markets = await provider.fetchMarkets(filters);

      // Prevent caching for filtered markets (may change with env vars)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Group by event
    const events = groupMarketsByEvent(markets);

    // Sort events by total volume
    events.sort((a, b) => b.totalVolume - a.totalVolume);

    return res.status(200).json({
      events,
      meta: {
        provider: provider.id,
        category: fetchAll ? 'all' : config.category,
        filtered: !fetchAll,
        count: events.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Events API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message,
    });
  }
}
