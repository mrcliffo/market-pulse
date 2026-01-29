/**
 * Editorial engine
 * Calculates all editorial themes from market and vote data
 */

import {
  themeCalculators,
  crowdDependentThemes,
} from './themes.js';
import { enrichWithEditorial, THEME_LABELS, THEME_COLORS } from './copy.js';

/**
 * Calculate all editorial themes
 * @param {object[]} markets - Normalized markets
 * @param {object} voteResults - Vote results keyed by market slug
 * @returns {object} - Editorial themes with markets
 */
export function calculateEditorial(markets, voteResults = {}) {
  // Transform vote results for theme calculations
  const crowdVotes = {};
  const voteCounts = {};

  for (const [slug, result] of Object.entries(voteResults)) {
    crowdVotes[slug] = {
      yesPercent: result.yesPercent || 0,
      noPercent: result.noPercent || 0,
    };
    voteCounts[slug] = {
      total: result.total || 0,
    };
  }

  const hasVoteData = Object.keys(crowdVotes).length > 0;

  // Calculate each theme
  const themes = {
    bigMovers: themeCalculators.bigMovers(markets)
      .map(m => enrichWithEditorial('bigMovers', m)),

    debateFuel: themeCalculators.debateFuel(markets)
      .map(m => enrichWithEditorial('debateFuel', m)),

    sentimentGaps: hasVoteData
      ? themeCalculators.sentimentGaps(markets, crowdVotes)
          .map(m => enrichWithEditorial('sentimentGaps', m))
      : [],

    longshotWatch: themeCalculators.longshotWatch(markets)
      .map(m => enrichWithEditorial('longshotWatch', m)),

    crowdFavorites: hasVoteData
      ? themeCalculators.crowdFavorites(markets, crowdVotes)
          .map(m => enrichWithEditorial('crowdFavorites', m))
      : [],

    volumeSurge: themeCalculators.volumeSurge(markets)
      .map(m => enrichWithEditorial('volumeSurge', m)),

    fadingFast: themeCalculators.fadingFast(markets)
      .map(m => enrichWithEditorial('fadingFast', m)),

    mostEngaged: hasVoteData
      ? themeCalculators.mostEngaged(markets, crowdVotes, voteCounts)
          .map(m => enrichWithEditorial('mostEngaged', m))
      : [],

    freshMarkets: themeCalculators.freshMarkets(markets)
      .map(m => enrichWithEditorial('freshMarkets', m)),
  };

  return themes;
}

/**
 * Editorial rotation configuration
 * Defines the order and duration for theme cycling
 */
export const EDITORIAL_ROTATION = [
  { theme: 'bigMovers', duration: 12000 },
  { theme: 'debateFuel', duration: 10000 },
  { theme: 'sentimentGaps', duration: 12000 },
  { theme: 'longshotWatch', duration: 10000 },
  { theme: 'crowdFavorites', duration: 10000 },
  { theme: 'volumeSurge', duration: 10000 },
  { theme: 'fadingFast', duration: 10000 },
  { theme: 'mostEngaged', duration: 10000 },
];

/**
 * Get active themes (non-empty themes only)
 * @param {object} themes - Calculated themes
 * @returns {string[]} - Array of active theme names
 */
export function getActiveThemes(themes) {
  return EDITORIAL_ROTATION
    .filter(item => themes[item.theme]?.length > 0)
    .map(item => item.theme);
}

/**
 * Get next theme in rotation
 * @param {string} currentTheme - Current theme name
 * @param {object} themes - Calculated themes
 * @returns {string} - Next theme name
 */
export function getNextTheme(currentTheme, themes) {
  const activeThemes = getActiveThemes(themes);
  if (activeThemes.length === 0) return null;

  const currentIndex = activeThemes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % activeThemes.length;

  return activeThemes[nextIndex];
}

/**
 * Get next market in current theme
 * @param {string} theme - Theme name
 * @param {number} currentIndex - Current market index
 * @param {object} themes - Calculated themes
 * @returns {object} - { market, index }
 */
export function getNextMarket(theme, currentIndex, themes) {
  const themeMarkets = themes[theme] || [];
  if (themeMarkets.length === 0) return { market: null, index: 0 };

  const nextIndex = (currentIndex + 1) % themeMarkets.length;
  return { market: themeMarkets[nextIndex], index: nextIndex };
}

export { THEME_LABELS, THEME_COLORS } from './copy.js';
export { crowdDependentThemes } from './themes.js';
