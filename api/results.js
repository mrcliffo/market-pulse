/**
 * GET /api/results
 * Returns aggregated vote results
 */

import { getAllVoteResults } from '../lib/supabase.js';
import { getConfig } from '../lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = getConfig();
    const data = await getAllVoteResults(config.provider);

    return res.status(200).json({
      results: data.results || {},
      totalVotes: data.totalVotes || 0,
      marketsWithVotes: data.marketsWithVotes || 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Results API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch vote results',
      message: error.message,
    });
  }
}
