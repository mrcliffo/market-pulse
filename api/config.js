/**
 * GET /api/config
 * Returns current deployment configuration (public config only)
 */

import { getConfig } from '../lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = getConfig();

    // Return only public configuration (no secrets)
    return res.status(200).json({
      provider: config.provider,
      category: config.category,
      eventFilters: config.eventFilters,
      blacklist: config.blacklist,
      siteName: config.siteName,
      deploymentId: config.deploymentId,
      countdown: config.countdown,
      affiliateUrl: config.affiliateUrl,
      refreshIntervals: config.refreshIntervals,
      defaultTheme: config.defaultTheme,
    });
  } catch (error) {
    console.error('Config API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch config',
      message: error.message,
    });
  }
}
