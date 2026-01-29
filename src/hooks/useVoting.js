/**
 * Hook for voting functionality
 */

import { useState, useEffect, useCallback } from 'react';

// Storage key helper - scoped by deployment ID to keep votes separate per deployment
function getStorageKey(baseKey, deploymentId) {
  const suffix = deploymentId ? `_${deploymentId}` : '';
  return `${baseKey}${suffix}`;
}

// Generate or retrieve voter token from localStorage
function getVoterToken() {
  if (typeof window === 'undefined') return null;

  let token = localStorage.getItem('voter_token');
  if (!token) {
    token = 'voter_' + crypto.randomUUID();
    localStorage.setItem('voter_token', token);
  }
  return token;
}

// Get voted markets from localStorage (scoped by deployment)
function getVotedMarkets(deploymentId) {
  if (typeof window === 'undefined') return {};

  try {
    const key = getStorageKey('voted_markets', deploymentId);
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

// Save voted market to localStorage (scoped by deployment)
function saveVotedMarket(slug, vote, priceAtVote, deploymentId) {
  if (typeof window === 'undefined') return;

  const key = getStorageKey('voted_markets', deploymentId);
  const voted = getVotedMarkets(deploymentId);
  voted[slug] = { vote, priceAtVote, timestamp: Date.now() };
  localStorage.setItem(key, JSON.stringify(voted));
}

export function useVoting(deploymentId = null) {
  const [voterToken, setVoterToken] = useState(null);
  const [votedMarkets, setVotedMarkets] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentDeploymentId, setCurrentDeploymentId] = useState(deploymentId);

  // Fetch deployment ID from config if not provided
  useEffect(() => {
    if (!deploymentId) {
      fetch('/api/config')
        .then(res => res.json())
        .then(config => {
          if (config.deploymentId) {
            setCurrentDeploymentId(config.deploymentId);
          }
        })
        .catch(() => {});
    }
  }, [deploymentId]);

  // Initialize from localStorage
  useEffect(() => {
    setVoterToken(getVoterToken());
    setVotedMarkets(getVotedMarkets(currentDeploymentId));
  }, [currentDeploymentId]);

  // Check if user has voted on a market
  const hasVoted = useCallback((slug) => {
    return votedMarkets[slug] !== undefined;
  }, [votedMarkets]);

  // Get user's vote for a market
  const getVote = useCallback((slug) => {
    return votedMarkets[slug] || null;
  }, [votedMarkets]);

  // Submit a vote
  const submitVote = useCallback(async (marketSlug, vote, priceAtVote) => {
    if (!voterToken) {
      setError('Unable to vote. Please refresh the page.');
      return null;
    }

    if (hasVoted(marketSlug)) {
      setError('You have already voted on this market.');
      return null;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterToken,
          marketSlug,
          vote,
          priceAtVote,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save to localStorage (scoped by deployment)
        saveVotedMarket(marketSlug, vote, priceAtVote, currentDeploymentId);

        // Update state
        setVotedMarkets(prev => ({
          ...prev,
          [marketSlug]: { vote, priceAtVote, timestamp: Date.now() },
        }));

        return data.results;
      } else {
        setError(data.error || 'Failed to submit vote.');
        return null;
      }
    } catch (err) {
      console.error('Vote submission error:', err);
      setError('Voting temporarily unavailable. Please try again.');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [voterToken, hasVoted, currentDeploymentId]);

  return {
    voterToken,
    votedMarkets,
    submitting,
    error,
    hasVoted,
    getVote,
    submitVote,
    clearError: () => setError(null),
  };
}

export default useVoting;
