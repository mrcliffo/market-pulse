/**
 * GET /api/prices?tokenId=xxx&interval=1w
 * Returns price history for sparklines
 */

import { getProvider } from '../lib/providers/index.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support both query param (Vercel) and route param (Express)
  const tokenId = req.query.tokenId || req.params?.tokenId;

  if (!tokenId) {
    return res.status(400).json({ error: 'Token ID is required' });
  }

  // Get interval from query params (default: 1w)
  const interval = req.query.interval || '1w';
  const validIntervals = ['1d', '1w', '1m'];

  if (!validIntervals.includes(interval)) {
    return res.status(400).json({
      error: 'Invalid interval',
      validIntervals,
    });
  }

  try {
    const provider = getProvider();
    const history = await provider.fetchPriceHistory(tokenId, interval);

    return res.status(200).json({
      history,
      tokenId,
      interval,
    });
  } catch (error) {
    console.error('Prices API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch price history',
      message: error.message,
    });
  }
}
