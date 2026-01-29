/**
 * POST /api/vote
 * Submit a vote
 */

import { submitVote } from '../lib/supabase.js';
import { getConfig } from '../lib/config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { voterToken, marketSlug, vote, priceAtVote } = req.body;

  // Validate required fields
  if (!voterToken) {
    return res.status(400).json({ success: false, error: 'Voter token is required' });
  }

  if (!marketSlug) {
    return res.status(400).json({ success: false, error: 'Market slug is required' });
  }

  if (!vote || !['yes', 'no'].includes(vote.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'Vote must be "yes" or "no"' });
  }

  if (priceAtVote === undefined || priceAtVote < 0 || priceAtVote > 1) {
    return res.status(400).json({ success: false, error: 'Valid price at vote is required (0-1)' });
  }

  try {
    const config = getConfig();
    const result = await submitVote({
      voterToken,
      marketSlug,
      vote: vote.toLowerCase(),
      priceAtVote,
      provider: config.provider,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(503).json(result);
    }
  } catch (error) {
    console.error('Vote API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Voting temporarily unavailable. Please try again.',
    });
  }
}
