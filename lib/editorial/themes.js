/**
 * Editorial theme algorithms
 * Each theme identifies markets matching specific narrative criteria
 */

/**
 * Theme 1: Big Mover
 * Markets with significant 24h price changes
 */
export function findBigMovers(markets) {
  return markets
    .filter(m => Math.abs(m.outcomes[0]?.change24h || 0) > 0.02)
    .sort((a, b) =>
      Math.abs(b.outcomes[0]?.change24h || 0) - Math.abs(a.outcomes[0]?.change24h || 0)
    )
    .slice(0, 10);
}

/**
 * Theme 2: Debate Fuel
 * Markets near 50% (coin flip territory)
 */
export function findDebateFuel(markets) {
  return markets
    .filter(m => {
      const price = m.outcomes[0]?.price || 0;
      return price >= 0.35 && price <= 0.65;
    })
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);
}

/**
 * Theme 3: Sentiment Gap
 * Markets where crowd vote differs significantly from market price
 */
export function findSentimentGaps(markets, crowdVotes) {
  if (!crowdVotes || Object.keys(crowdVotes).length === 0) {
    return [];
  }

  return markets
    .filter(m => {
      const crowdVote = crowdVotes[m.slug]?.yesPercent;
      if (crowdVote === undefined) return false;
      const marketPrice = (m.outcomes[0]?.price || 0) * 100;
      const gap = Math.abs(marketPrice - crowdVote);
      return gap > 5; // 5% gap threshold
    })
    .map(m => {
      const crowdVote = crowdVotes[m.slug].yesPercent;
      const marketPrice = (m.outcomes[0]?.price || 0) * 100;
      return {
        ...m,
        crowdVote: crowdVote / 100,
        gap: Math.abs(marketPrice - crowdVote) / 100,
      };
    })
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 8);
}

/**
 * Theme 4: Longshot Watch
 * Low odds markets gaining momentum
 */
export function findLongshotWatch(markets) {
  return markets
    .filter(m => {
      const price = m.outcomes[0]?.price || 0;
      const change = m.outcomes[0]?.change24h || 0;
      return price < 0.15 && price > 0.01 && change > 0.005;
    })
    .sort((a, b) =>
      (b.outcomes[0]?.change24h || 0) - (a.outcomes[0]?.change24h || 0)
    )
    .slice(0, 8);
}

/**
 * Theme 5: Crowd Favorites
 * Markets with high crowd conviction (≥85%)
 */
export function findCrowdFavorites(markets, crowdVotes) {
  if (!crowdVotes || Object.keys(crowdVotes).length === 0) {
    return [];
  }

  return markets
    .filter(m => {
      const vote = crowdVotes[m.slug];
      if (!vote) return false;
      const conviction = Math.max(vote.yesPercent, vote.noPercent);
      return conviction >= 85;
    })
    .map(m => {
      const vote = crowdVotes[m.slug];
      const conviction = Math.max(vote.yesPercent, vote.noPercent);
      return {
        ...m,
        crowdVote: vote.yesPercent / 100,
        conviction: conviction / 100,
        crowdSaysYes: vote.yesPercent > vote.noPercent,
      };
    })
    .sort((a, b) => b.conviction - a.conviction)
    .slice(0, 8);
}

/**
 * Theme 6: Volume Surge
 * Markets with high recent trading activity
 */
export function findVolumeSurge(markets) {
  return markets
    .filter(m => {
      const vol24h = m.volume24h || 0;
      const totalVol = m.volume || 0;
      return vol24h > 10000 && totalVol > 0 && (vol24h / totalVol) > 0.08;
    })
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 8);
}

/**
 * Theme 7: Fading Fast
 * Markets losing support (dropping significantly)
 */
export function findFadingFast(markets) {
  return markets
    .filter(m => (m.outcomes[0]?.change24h || 0) < -0.02)
    .sort((a, b) =>
      (a.outcomes[0]?.change24h || 0) - (b.outcomes[0]?.change24h || 0)
    )
    .slice(0, 10);
}

/**
 * Theme 8: Most Engaged
 * Markets with highest vote counts
 */
export function findMostEngaged(markets, crowdVotes, voteCounts) {
  if (!crowdVotes || !voteCounts) {
    return [];
  }

  return markets
    .filter(m => crowdVotes[m.slug] !== undefined)
    .map(m => ({
      ...m,
      crowdVote: crowdVotes[m.slug]?.yesPercent / 100,
      voteCount: voteCounts[m.slug]?.total || 0,
    }))
    .sort((a, b) => b.voteCount - a.voteCount || b.volume - a.volume)
    .slice(0, 8);
}

/**
 * Theme 9: Fresh Market
 * Recently created markets
 */
export function findFreshMarkets(markets) {
  const cutoff = Date.now() - (48 * 60 * 60 * 1000); // 48 hours

  return markets
    .filter(m => new Date(m.createdAt).getTime() > cutoff)
    .sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);
}

/**
 * All theme calculators
 */
export const themeCalculators = {
  bigMovers: findBigMovers,
  debateFuel: findDebateFuel,
  sentimentGaps: findSentimentGaps,
  longshotWatch: findLongshotWatch,
  crowdFavorites: findCrowdFavorites,
  volumeSurge: findVolumeSurge,
  fadingFast: findFadingFast,
  mostEngaged: findMostEngaged,
  freshMarkets: findFreshMarkets,
};

/**
 * Themes that require crowd vote data
 */
export const crowdDependentThemes = [
  'sentimentGaps',
  'crowdFavorites',
  'mostEngaged',
];
