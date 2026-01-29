/**
 * Data transformation and normalization utilities
 */

/**
 * Parse Kalshi fixed-point price to decimal
 * @param {string|number} price - Price in dollars (string like "0.5600") or cents (integer)
 * @returns {number} - Price as decimal 0-1
 */
function parseKalshiPrice(price) {
  if (price === null || price === undefined) return 0;

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

/**
 * Parse Kalshi fixed-point volume/count to number
 * @param {string} volumeFp - Volume as fixed-point string (e.g., "10.00")
 * @returns {number} - Volume as number
 */
function parseKalshiVolume(volumeFp) {
  if (!volumeFp) return 0;
  return parseFloat(volumeFp) || 0;
}

/**
 * Normalize Kalshi market data to unified format
 * @param {object} raw - Raw Kalshi market data
 * @param {object} event - Parent event data
 * @returns {object} - Normalized market
 */
export function normalizeKalshiMarket(raw, event) {
  // Calculate current price from bid/ask midpoint or last price
  const yesBid = parseKalshiPrice(raw.yes_bid_dollars || raw.yes_bid);
  const yesAsk = parseKalshiPrice(raw.yes_ask_dollars || raw.yes_ask);
  const lastPrice = parseKalshiPrice(raw.last_price_dollars || raw.last_price);

  // Use midpoint of bid/ask if available, otherwise use last price
  let currentPrice;
  if (yesBid > 0 && yesAsk > 0) {
    currentPrice = (yesBid + yesAsk) / 2;
  } else {
    currentPrice = lastPrice || 0.5;
  }

  // Calculate 24h change from previous prices
  const prevPrice = parseKalshiPrice(raw.previous_price_dollars || raw.previous_price);
  const change24h = prevPrice > 0 ? currentPrice - prevPrice : 0;

  // Parse volumes
  const volume = parseKalshiVolume(raw.volume_fp || raw.volume);
  const volume24h = parseKalshiVolume(raw.volume_24h_fp || raw.volume_24h);
  const openInterest = parseKalshiVolume(raw.open_interest_fp || raw.open_interest);

  // Determine if market is resolved
  const resolvedStatuses = ['determined', 'finalized', 'settled'];
  const isResolved = resolvedStatuses.includes(raw.status);

  // Get market title - Kalshi uses different naming conventions
  // subtitle often has the specific outcome name
  const marketTitle = raw.subtitle || raw.title || event?.title || 'Unknown';

  return {
    id: raw.ticker,
    slug: raw.ticker, // Kalshi uses ticker as the unique identifier
    question: marketTitle,
    outcomes: [{
      name: marketTitle,
      price: currentPrice,
      change24h: change24h,
      change7d: 0, // Kalshi doesn't provide 7d change directly
      tokenId: raw.ticker,
      sparkline: null,
    }],
    volume: volume,
    volume24h: volume24h,
    liquidity: openInterest, // Use open interest as liquidity proxy
    event: {
      id: raw.event_ticker || event?.event_ticker,
      title: event?.title || extractEventTitle(marketTitle),
      category: event?.category || 'unknown',
    },
    tokenIds: [raw.ticker],
    seriesTicker: raw.series_ticker || event?.series_ticker, // Needed for candlesticks
    providerUrl: `https://kalshi.com/markets/${raw.event_ticker || event?.event_ticker}`,
    resolved: isResolved,
    resolution: raw.result || null,
    resolvedAt: null, // Kalshi doesn't provide this directly
    createdAt: raw.open_time || new Date().toISOString(),
    resolvesAt: raw.close_time || raw.expiration_time || null,
  };
}

/**
 * Normalize Polymarket market data to unified format
 * @param {object} raw - Raw Polymarket market data
 * @param {object} event - Parent event data
 * @returns {object} - Normalized market
 */
export function normalizePolymarketMarket(raw, event) {
  const outcomePrices = parseOutcomePrices(raw.outcomePrices);
  const outcomes = parseOutcomes(raw.outcomes);
  const tokenIds = parseTokenIds(raw.clobTokenIds);

  // Get the best display name for this market
  // Polymarket uses different fields depending on market type:
  // - groupItemTitle: for grouped markets (e.g., "Patrick Mahomes" in "Super Bowl MVP")
  // - title: sometimes contains the actual name
  // - question: the full question which may contain the name
  // - outcomes: for binary markets (e.g., ["Yes", "No"])
  // Some markets have placeholder names like "Player M", "Coach A" - try multiple sources
  const getOutcomeName = (index) => {
    // For grouped markets (has groupItemTitle), use that as the primary source
    if (raw.groupItemTitle) {
      if (!isPlaceholderName(raw.groupItemTitle)) {
        return raw.groupItemTitle;
      }
      // groupItemTitle is a placeholder - try to extract from question
      const extracted = extractNameFromQuestion(raw.question);
      if (extracted) return extracted;

      // Return the placeholder - it will be filtered out later
      return raw.groupItemTitle;
    }

    // For binary markets without groupItemTitle, use outcomes array
    const candidates = [
      raw.title,
      outcomes[index],
    ];

    // Find first non-placeholder name (but allow Yes/No for binary markets)
    for (const candidate of candidates) {
      if (candidate && !isPlaceholderName(candidate)) {
        return candidate;
      }
    }

    // Try to extract from question
    const extracted = extractNameFromQuestion(raw.question);
    if (extracted) return extracted;

    // If question itself is short and descriptive, use it
    if (raw.question && raw.question.length < 40 && !isPlaceholderName(raw.question)) {
      return raw.question;
    }

    // For binary markets, Yes/No is acceptable
    return outcomes[index] || 'Unknown';
  };

  return {
    id: raw.id,
    slug: raw.slug || generateSlug(raw.question),
    question: raw.question,
    // For grouped markets (groupItemTitle exists), this is typically a single-outcome market
    // representing one choice in a multi-choice event
    outcomes: raw.groupItemTitle
      ? [{
          name: getOutcomeName(0),
          price: outcomePrices[0] || 0,
          change24h: parseFloat(raw.oneDayPriceChange) || 0,
          change7d: parseFloat(raw.oneWeekPriceChange) || 0,
          tokenId: tokenIds[0] || null,
          sparkline: null,
        }]
      : outcomes.map((name, i) => ({
          name: getOutcomeName(i),
          price: outcomePrices[i] || 0,
          change24h: parseFloat(raw.oneDayPriceChange) || 0,
          change7d: parseFloat(raw.oneWeekPriceChange) || 0,
          tokenId: tokenIds[i] || null,
          sparkline: null,
        })),
    volume: parseFloat(raw.volume) || 0,
    volume24h: parseFloat(raw.volume24hr) || 0,
    liquidity: parseFloat(raw.liquidity) || 0,
    event: {
      id: event?.id || raw.id,
      title: event?.title || extractEventTitle(raw.question),
      category: event?.category || 'unknown',
    },
    tokenIds: tokenIds,
    providerUrl: `https://polymarket.com/event/${raw.slug}`,
    resolved: raw.closed || false,
    resolution: raw.resolution || null,
    resolvedAt: raw.resolvedAt || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    resolvesAt: raw.endDate || null,
  };
}

/**
 * Parse outcomes from various formats
 * @param {string|array} outcomes - Raw outcomes data
 * @returns {string[]} - Array of outcome names
 */
function parseOutcomes(outcomes) {
  if (!outcomes) return ['Yes', 'No'];
  if (Array.isArray(outcomes)) {
    return outcomes;
  }
  if (typeof outcomes === 'string') {
    try {
      const parsed = JSON.parse(outcomes);
      if (Array.isArray(parsed)) return parsed;
      return ['Yes', 'No'];
    } catch {
      return ['Yes', 'No'];
    }
  }
  return ['Yes', 'No'];
}

/**
 * Parse token IDs from various formats
 * @param {string|array} tokenIds - Raw token IDs data
 * @returns {string[]} - Array of token IDs
 */
function parseTokenIds(tokenIds) {
  if (!tokenIds) return [];
  if (Array.isArray(tokenIds)) {
    return tokenIds;
  }
  if (typeof tokenIds === 'string') {
    try {
      const parsed = JSON.parse(tokenIds);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Parse outcome prices from various formats
 * @param {string|array} prices - Raw prices data
 * @returns {number[]} - Array of prices as decimals
 */
function parseOutcomePrices(prices) {
  if (!prices) return [0.5, 0.5];
  if (Array.isArray(prices)) {
    return prices.map(p => parseFloat(p) || 0);
  }
  if (typeof prices === 'string') {
    try {
      const parsed = JSON.parse(prices);
      return parsed.map(p => parseFloat(p) || 0);
    } catch {
      return [0.5, 0.5];
    }
  }
  return [0.5, 0.5];
}

/**
 * Generate URL-safe slug from question
 * @param {string} question - Market question
 * @returns {string} - URL-safe slug
 */
function generateSlug(question) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

/**
 * Extract event title from market question
 * @param {string} question - Market question
 * @returns {string} - Extracted event title
 */
function extractEventTitle(question) {
  // Try to extract meaningful event title
  const patterns = [
    /Will (.+) win/i,
    /Will (.+) be/i,
    /(.+) winner/i,
  ];
  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) return match[1].trim();
  }
  return question.slice(0, 50);
}

/**
 * Check if a name is a placeholder (e.g., "Player K", "Coach A", "Other", "Person 50%")
 * @param {string} name - Name to check
 * @returns {boolean} - True if placeholder
 */
function isPlaceholderName(name) {
  if (!name) return true;
  const trimmed = name.trim();

  // Direct placeholder patterns - exact matches or clear patterns
  const placeholderPatterns = [
    /^[A-Z]$/,  // Single letter
    /^[A-Z]{2}$/,  // Two letters like "AB"
    /^\d+%?$/,  // Just numbers or percentages
    /^(Other|TBD|TBA|Unknown|N\/A|None|Null|Cancelled|Canceled)$/i,
    /^Any\s+Other/i,  // "Any Other Player", "Any Other Coach", etc.
    /^someone\s+else$/i,  // "someone else"
    /^another\s+(person|player|coach|team|candidate)/i,  // "another person", etc.
    /^(no\s+one|nobody|none\s+of)/i,  // "no one", "nobody", "none of the above"
    /^field$/i,  // Generic "Field" option
    /^the\s+field$/i,  // "The Field"
    // Vague descriptive placeholders
    /^the\s+(team|player|person|coach|candidate)\s+that/i,  // "the team that", "the player that"
    /^a\s+(team|player|person|coach|candidate)\s+(that|who|from)/i,  // "a team that", "a player who"
    /^(team|player|person)\s+(from|in|with)\s+/i,  // "team from", "player in"
    // Placeholder patterns: "Person A", "Player 50%", "Candidate #1", etc.
    // Requires a SPACE after the keyword to avoid matching "Personal", "Teammates", etc.
    /^(Player|Coach|Team|Candidate|Option|Person|Individual|Nominee|Contender)\s+[A-Z]{1,3}$/i,  // "Person A", "Player AB"
    /^(Player|Coach|Team|Candidate|Option|Person|Individual|Nominee|Contender)\s+\d+%?$/i,  // "Person 50%", "Player 123"
    /^(Player|Coach|Team|Candidate|Option|Person|Individual|Nominee|Contender)\s+#?\d+$/i,  // "Person #1"
    /^(Player|Coach|Team|Candidate|Option|Person|Individual|Nominee|Contender)\s+[A-Z]\d+$/i,  // "Person A1"
    /^(Player|Coach|Team|Candidate|Option|Person|Individual|Nominee|Contender)\s+\d+[A-Z]$/i,  // "Person 1A"
  ];

  if (placeholderPatterns.some(pattern => pattern.test(trimmed))) {
    return true;
  }

  // Very short names that are likely placeholders (but allow Yes/No for binary markets)
  if (trimmed.length <= 2 && !/^(No|UK|US|EU|UN|AI)$/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Extract a name from a market question
 * Used as fallback when groupItemTitle contains placeholders
 * @param {string} question - Market question
 * @returns {string|null} - Extracted name or null
 */
function extractNameFromQuestion(question) {
  if (!question) return null;

  // Common patterns in Polymarket questions
  const patterns = [
    /^Will (.+?) win/i,           // "Will Patrick Mahomes win..."
    /^Will (.+?) be /i,           // "Will LeBron James be..."
    /^(.+?) to win/i,             // "Patrick Mahomes to win..."
    /^(.+?) - /,                  // "Patrick Mahomes - Super Bowl MVP"
    /winner[:\s]+(.+?)(?:\?|$)/i, // "Winner: Patrick Mahomes?"
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Make sure we got a reasonable name (not too long, not a placeholder)
      if (name.length > 2 && name.length < 50 && !isPlaceholderName(name)) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Group markets by their parent event
 * @param {object[]} markets - Array of normalized markets
 * @param {boolean} filterPlaceholders - Whether to filter out placeholder names
 * @returns {object[]} - Array of grouped events
 */
export function groupMarketsByEvent(markets, filterPlaceholders = true) {
  const eventMap = new Map();

  for (const market of markets) {
    const eventId = market.event.id;
    if (!eventMap.has(eventId)) {
      eventMap.set(eventId, {
        id: eventId,
        title: market.event.title,
        category: market.event.category,
        outcomes: [],
        totalVolume: 0,
        liquidity: 0,
      });
    }

    const event = eventMap.get(eventId);

    // Process ALL outcomes from the market, not just the first one
    // This handles both:
    // - Grouped markets (1 outcome, from groupItemTitle)
    // - Binary/multi-outcome markets (multiple outcomes, e.g., AFC/NFC)
    for (let i = 0; i < market.outcomes.length; i++) {
      const outcome = market.outcomes[i];
      const outcomeName = outcome?.name || market.question;

      // Skip placeholder names if filtering is enabled
      if (filterPlaceholders && isPlaceholderName(outcomeName)) {
        continue;
      }

      // Skip "Yes"/"No" outcomes for events that have meaningful named outcomes
      // (e.g., skip "Yes" in a multi-team event, but keep "Yes"/"No" for binary questions)
      if ((outcomeName === 'Yes' || outcomeName === 'No') && market.outcomes.length === 2) {
        // Check if this is part of a grouped event with real outcomes
        const existingOutcomes = event.outcomes.filter(o => o.name !== 'Yes' && o.name !== 'No');
        if (existingOutcomes.length > 0) {
          continue;
        }
      }

      event.outcomes.push({
        name: outcomeName,
        price: outcome?.price || 0,
        change24h: outcome?.change24h || 0,
        volume: market.volume,
        slug: market.slug,
        marketId: market.id,
        tokenId: outcome?.tokenId || market.tokenIds?.[i] || null,
      });
    }

    event.totalVolume += market.volume;
    event.liquidity += market.liquidity;
  }

  // Sort outcomes by price (highest first) within each event
  for (const event of eventMap.values()) {
    event.outcomes.sort((a, b) => b.price - a.price);
  }

  return Array.from(eventMap.values());
}

/**
 * Filter markets by configuration
 * @param {object[]} markets - Array of markets
 * @param {object} filters - Filter configuration
 * @returns {object[]} - Filtered markets
 */
export function filterMarkets(markets, filters) {
  return markets.filter(market => {
    const title = (market.question + ' ' + market.event.title).toLowerCase();

    // Check if matches any event filter
    const matchesFilter = filters.eventFilters.length === 0 ||
      filters.eventFilters.some(term => title.includes(term));

    // Check if matches any blacklist term
    const matchesBlacklist = filters.blacklist.some(term => title.includes(term));

    // Check if active (not resolved)
    const isActive = !filters.activeOnly || !market.resolved;

    return matchesFilter && !matchesBlacklist && isActive;
  });
}

/**
 * Sort markets by various criteria
 * @param {object[]} markets - Array of markets
 * @param {string} sortBy - Sort criteria
 * @returns {object[]} - Sorted markets
 */
export function sortMarkets(markets, sortBy = 'volume') {
  const sorted = [...markets];

  switch (sortBy) {
    case 'volume':
      return sorted.sort((a, b) => b.volume - a.volume);
    case 'volume24h':
      return sorted.sort((a, b) => b.volume24h - a.volume24h);
    case 'change':
      return sorted.sort((a, b) =>
        Math.abs(b.outcomes[0]?.change24h || 0) - Math.abs(a.outcomes[0]?.change24h || 0)
      );
    case 'price':
      return sorted.sort((a, b) =>
        (b.outcomes[0]?.price || 0) - (a.outcomes[0]?.price || 0)
      );
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default:
      return sorted;
  }
}
