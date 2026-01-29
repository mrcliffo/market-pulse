/**
 * GET /api/debug-markets
 * Debug endpoint to see raw Polymarket data structure
 */

import { getConfig } from '../lib/config.js';

const GAMMA_BASE_URL = 'https://gamma-api.polymarket.com';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = getConfig();
    const baseUrl = config.providerUrls?.polymarket?.gamma || GAMMA_BASE_URL;

    // Fetch raw events - search for NFL specifically
    const url = `${baseUrl}/events?active=true&closed=false&limit=100&tag=nfl`;
    const response = await fetch(url);
    let events = await response.json();

    // If no NFL tag results, try without tag
    if (!events || events.length === 0) {
      const fallbackUrl = `${baseUrl}/events?active=true&closed=false&limit=100`;
      const fallbackResponse = await fetch(fallbackUrl);
      events = await fallbackResponse.json();
    }

    // Find an NFL event to examine
    const nflEvent = events.find(e =>
      e.title?.toLowerCase().includes('nfl') ||
      e.title?.toLowerCase().includes('mvp') ||
      e.title?.toLowerCase().includes('coach')
    );

    if (!nflEvent) {
      return res.status(200).json({
        message: 'No NFL event found in first 10 events',
        eventTitles: events.map(e => e.title),
      });
    }

    // Get detailed market fields for first few markets
    const marketSample = (nflEvent.markets || []).slice(0, 5).map(m => ({
      // All potentially useful name fields
      groupItemTitle: m.groupItemTitle,
      title: m.title,
      question: m.question,
      outcomes: m.outcomes,
      description: m.description,
      // Other fields that might have names
      slug: m.slug,
      // Raw field names for inspection
      _allFields: Object.keys(m),
    }));

    return res.status(200).json({
      event: {
        id: nflEvent.id,
        title: nflEvent.title,
        slug: nflEvent.slug,
        marketCount: nflEvent.markets?.length || 0,
      },
      marketSamples: marketSample,
      rawFirstMarket: nflEvent.markets?.[0] || null,
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch debug data',
      message: error.message,
    });
  }
}
