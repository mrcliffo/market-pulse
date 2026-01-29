/**
 * Environment configuration loader
 * Centralizes all environment variable access with defaults and validation
 */

function parseList(value) {
  if (!value) return [];
  return value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnv(key, defaultValue) {
  const value = process.env[key];
  return value ? value.trim() : defaultValue;
}

function getEnvNumber(key, defaultValue) {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

export function getConfig() {
  return {
    // Provider
    provider: getEnv('PROVIDER', 'polymarket'),
    category: getEnv('CATEGORY', 'sports'),
    eventFilters: parseList(getEnv('EVENT_FILTERS', '')),
    blacklist: parseList(getEnv('BLACKLIST', '')),

    // Display
    siteName: getEnv('SITE_NAME', 'Market Pulse'),
    deploymentId: getEnv('DEPLOYMENT_ID', 'default'),
    defaultTheme: getEnv('DEFAULT_THEME', 'default'),

    // Countdown (optional)
    countdown: process.env.COUNTDOWN_DATE ? {
      date: process.env.COUNTDOWN_DATE,
      label: getEnv('COUNTDOWN_LABEL', 'Event'),
    } : null,

    // Refresh intervals (in seconds)
    refreshIntervals: {
      data: getEnvNumber('DATA_REFRESH_INTERVAL', 60),
      votes: getEnvNumber('VOTE_REFRESH_INTERVAL', 5),
      hero: getEnvNumber('HERO_ROTATION_INTERVAL', 30),
      editorial: getEnvNumber('EDITORIAL_ROTATION_INTERVAL', 10),
    },

    // Supabase
    supabase: {
      url: getEnv('SUPABASE_URL', ''),
      anonKey: getEnv('SUPABASE_ANON_KEY', ''),
    },

    // Affiliate
    affiliateUrl: getEnv('AFFILIATE_URL', 'https://polymarket.com'),

    // Provider URLs
    providerUrls: {
      polymarket: {
        gamma: getEnv('POLYMARKET_GAMMA_URL', 'https://gamma-api.polymarket.com'),
        clob: getEnv('POLYMARKET_CLOB_URL', 'https://clob.polymarket.com'),
      },
      kalshi: {
        api: getEnv('KALSHI_API_URL', 'https://api.elections.kalshi.com/trade-api/v2'),
      },
    },
  };
}

export function getFilterConfig() {
  const config = getConfig();
  return {
    category: config.category,
    eventFilters: config.eventFilters,
    blacklist: config.blacklist,
    activeOnly: true,
  };
}

export function isSupabaseConfigured() {
  const config = getConfig();
  return Boolean(config.supabase.url && config.supabase.anonKey);
}
