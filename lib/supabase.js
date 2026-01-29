/**
 * Supabase client and voting operations
 */

import { createClient } from '@supabase/supabase-js';
import { getConfig, isSupabaseConfigured } from './config.js';

let supabaseClient = null;

/**
 * Get or create Supabase client
 * @returns {SupabaseClient|null}
 */
export function getSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    const config = getConfig();
    supabaseClient = createClient(
      config.supabase.url,
      config.supabase.anonKey
    );
  }

  return supabaseClient;
}

/**
 * Submit a vote
 * @param {object} voteData - Vote data
 * @returns {Promise<{success: boolean, voteId?: string, results?: object, error?: string}>}
 */
export async function submitVote({ voterToken, marketSlug, vote, priceAtVote, provider }) {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Voting temporarily unavailable. Please try again.' };
  }

  const config = getConfig();
  const deploymentId = config.deploymentId;
  const providerName = provider || config.provider || 'polymarket';

  try {
    // Insert vote (upsert to handle duplicate attempts)
    const { data, error } = await supabase
      .from('votes')
      .upsert({
        deployment_id: deploymentId,
        voter_token: voterToken,
        market_slug: marketSlug,
        vote: vote,
        price_at_vote: priceAtVote,
        provider: providerName,
      }, {
        onConflict: 'deployment_id,voter_token,market_slug,provider',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Vote submission error:', error);
      return { success: false, error: 'Voting temporarily unavailable. Please try again.' };
    }

    // Fetch updated results
    const results = await getVoteResults(marketSlug, providerName);

    return {
      success: true,
      voteId: data.id,
      results,
    };
  } catch (error) {
    console.error('Vote submission failed:', error);
    return { success: false, error: 'Voting temporarily unavailable. Please try again.' };
  }
}

/**
 * Get vote results for a market
 * @param {string} marketSlug - Market slug
 * @param {string} [provider] - Provider name (defaults to config provider)
 * @returns {Promise<object>} - Vote results
 */
export async function getVoteResults(marketSlug, provider) {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const config = getConfig();
  const deploymentId = config.deploymentId;
  const providerName = provider || config.provider || 'polymarket';

  try {
    const { data, error } = await supabase
      .from('vote_aggregates')
      .select('*')
      .eq('deployment_id', deploymentId)
      .eq('market_slug', marketSlug)
      .eq('provider', providerName)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Failed to fetch vote results:', error);
      return null;
    }

    if (!data) {
      return {
        yes: 0,
        no: 0,
        total: 0,
        yesPercent: 0,
        noPercent: 0,
      };
    }

    return {
      yes: data.yes_count,
      no: data.no_count,
      total: data.total_count,
      yesPercent: data.yes_percent,
      noPercent: data.no_percent,
    };
  } catch (error) {
    console.error('Failed to fetch vote results:', error);
    return null;
  }
}

/**
 * Get all vote results for deployment
 * @param {string} [provider] - Provider name (defaults to config provider)
 * @returns {Promise<object>} - All vote results keyed by market slug
 */
export async function getAllVoteResults(provider) {
  const supabase = getSupabase();
  if (!supabase) {
    return { results: {}, totalVotes: 0, marketsWithVotes: 0 };
  }

  const config = getConfig();
  const deploymentId = config.deploymentId;
  const providerName = provider || config.provider || 'polymarket';

  try {
    const { data, error } = await supabase
      .from('vote_aggregates')
      .select('*')
      .eq('deployment_id', deploymentId)
      .eq('provider', providerName);

    if (error) {
      console.error('Failed to fetch all vote results:', error);
      return {};
    }

    const results = {};
    let totalVotes = 0;

    for (const row of data || []) {
      results[row.market_slug] = {
        yes: row.yes_count,
        no: row.no_count,
        total: row.total_count,
        yesPercent: row.yes_percent,
        noPercent: row.no_percent,
      };
      totalVotes += row.total_count;
    }

    return {
      results,
      totalVotes,
      marketsWithVotes: Object.keys(results).length,
    };
  } catch (error) {
    console.error('Failed to fetch all vote results:', error);
    return { results: {}, totalVotes: 0, marketsWithVotes: 0 };
  }
}

/**
 * Get user's votes
 * @param {string} voterToken - Voter token
 * @param {string} [provider] - Provider name (defaults to config provider)
 * @returns {Promise<object[]>} - User's votes
 */
export async function getUserVotes(voterToken, provider) {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  const config = getConfig();
  const deploymentId = config.deploymentId;
  const providerName = provider || config.provider || 'polymarket';

  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('deployment_id', deploymentId)
      .eq('voter_token', voterToken)
      .eq('provider', providerName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user votes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch user votes:', error);
    return [];
  }
}

/**
 * Check if user has voted on a market
 * @param {string} voterToken - Voter token
 * @param {string} marketSlug - Market slug
 * @param {string} [provider] - Provider name (defaults to config provider)
 * @returns {Promise<object|null>} - Vote data or null
 */
export async function getUserVoteForMarket(voterToken, marketSlug, provider) {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const config = getConfig();
  const deploymentId = config.deploymentId;
  const providerName = provider || config.provider || 'polymarket';

  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('deployment_id', deploymentId)
      .eq('voter_token', voterToken)
      .eq('market_slug', marketSlug)
      .eq('provider', providerName)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to check user vote:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Failed to check user vote:', error);
    return null;
  }
}
