/**
 * GET /api/editorial
 * Returns all pre-calculated editorial themes
 */

import { getProvider } from '../lib/providers/index.js';
import { getFilterConfig } from '../lib/config.js';
import { calculateEditorial } from '../lib/editorial/index.js';
import { getAllVoteResults } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const provider = getProvider();
    const filters = getFilterConfig();

    // Fetch markets from provider
    const markets = await provider.fetchMarkets(filters);

    // Fetch vote results (may be empty if Supabase not configured)
    const { results: voteResults } = await getAllVoteResults();

    // Calculate editorial themes
    const themes = calculateEditorial(markets, voteResults);

    return res.status(200).json({
      themes,
      meta: {
        lastUpdated: new Date().toISOString(),
        votesIncluded: Object.keys(voteResults).length > 0,
      },
    });
  } catch (error) {
    console.error('Editorial API error:', error);
    return res.status(500).json({
      error: 'Failed to calculate editorial',
      message: error.message,
    });
  }
}
