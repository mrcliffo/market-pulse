/**
 * Provider factory
 * Returns the appropriate provider adapter based on configuration
 */

import { getConfig } from '../config.js';
import { polymarketProvider } from './polymarket.js';
import { kalshiProvider } from './kalshi.js';

// Provider registry
const providers = {
  polymarket: polymarketProvider,
  kalshi: kalshiProvider,
};

/**
 * Get the configured provider adapter
 * @returns {MarketProvider} - Provider instance
 */
export function getProvider() {
  const config = getConfig();
  const providerId = config.provider.toLowerCase().trim();

  const provider = providers[providerId];
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}. Available: ${Object.keys(providers).join(', ')}`);
  }

  return provider;
}

/**
 * Get provider by explicit ID
 * @param {string} id - Provider ID
 * @returns {MarketProvider} - Provider instance
 */
export function getProviderById(id) {
  const provider = providers[id.toLowerCase()];
  if (!provider) {
    throw new Error(`Unknown provider: ${id}. Available: ${Object.keys(providers).join(', ')}`);
  }
  return provider;
}

/**
 * List available providers
 * @returns {string[]} - Array of provider IDs
 */
export function listProviders() {
  return Object.keys(providers);
}

export { polymarketProvider } from './polymarket.js';
export { kalshiProvider } from './kalshi.js';
