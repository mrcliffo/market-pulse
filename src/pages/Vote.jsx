/**
 * Vote companion page - mobile-friendly voting interface
 * Groups markets by events with collapsible sections
 * Only shows events that have been selected in the control panel
 */

import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, useTheme } from '../themes/index.jsx';
import { useEvents, useVoting, useBroadcastSync } from '../hooks/index.js';
import { formatPrice, formatChange, formatVolume, getArrow, calculatePayout } from '../utils/formatters.js';

const TABS = [
  { id: 'selected', label: 'Selected' },
  { id: 'myVotes', label: 'My Votes' },
];

/**
 * Compact vote buttons for outcomes within events
 */
function OutcomeVoteButtons({ outcome, onVote, hasVoted, submitting }) {
  const { colors } = useTheme();

  if (hasVoted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: colors.textMuted,
      }}>
        <span style={{ color: colors.positive }}>✓</span> Voted
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
    }}>
      <button
        onClick={() => onVote(outcome.slug, 'yes', outcome.price || 0.5)}
        disabled={submitting}
        style={{
          padding: '6px 14px',
          backgroundColor: colors.positive,
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontFamily: 'Source Sans 3',
          fontWeight: 700,
          fontSize: '12px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1,
        }}
      >
        YES
      </button>
      <button
        onClick={() => onVote(outcome.slug, 'no', outcome.price || 0.5)}
        disabled={submitting}
        style={{
          padding: '6px 14px',
          backgroundColor: colors.negative,
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontFamily: 'Source Sans 3',
          fontWeight: 700,
          fontSize: '12px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1,
        }}
      >
        NO
      </button>
    </div>
  );
}

/**
 * Label badge component for Market/Audience distinction
 */
function SourceLabel({ type, colors }) {
  const isMarket = type === 'market';
  return (
    <span style={{
      fontSize: '9px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      padding: '2px 5px',
      borderRadius: '3px',
      backgroundColor: isMarket ? colors.primary + '20' : colors.accent + '20',
      color: isMarket ? colors.primary : colors.accent,
      marginRight: '6px',
    }}>
      {isMarket ? 'MARKET' : 'AUDIENCE'}
    </span>
  );
}

/**
 * Audience vote results shown inline with clear labeling
 */
function InlineAudienceVotes({ results, colors }) {
  if (!results || results.total === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      color: colors.textMuted,
      marginTop: '4px',
    }}>
      <SourceLabel type="audience" colors={colors} />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: colors.surfaceAlt,
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${results.yesPercent}%`,
            backgroundColor: colors.positive,
          }} />
        </div>
        <span>{results.yesPercent}% Yes</span>
      </div>
      <span>({results.total} votes)</span>
    </div>
  );
}

/**
 * Single outcome row within an event group
 */
function OutcomeRow({ outcome, onVote, userVote, submitting, results }) {
  const { colors } = useTheme();
  const change = outcome.change24h || 0;
  const changeColor = change > 0.001 ? colors.positive : change < -0.001 ? colors.negative : colors.textMuted;
  const hasVoted = Boolean(userVote);
  const hasAudienceVotes = results && results.total > 0;

  return (
    <div style={{
      padding: '12px',
      backgroundColor: colors.surface,
      borderRadius: '8px',
      marginBottom: '8px',
      border: `1px solid ${colors.border}`,
    }}>
      {/* Top row: Name and vote buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hasAudienceVotes ? '8px' : 0,
      }}>
        {/* Left: Outcome name and market price */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: colors.text,
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {outcome.name}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <SourceLabel type="market" colors={colors} />
            <span style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '16px',
              fontWeight: 600,
              color: colors.text,
            }}>
              {formatPrice(outcome.price || 0)}
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              color: changeColor,
            }}>
              {getArrow(change)} {formatChange(change)}
            </span>
          </div>
        </div>

        {/* Right: Vote buttons */}
        <div style={{ marginLeft: '12px', flexShrink: 0 }}>
          <OutcomeVoteButtons
            outcome={outcome}
            onVote={onVote}
            hasVoted={hasVoted}
            submitting={submitting}
          />
        </div>
      </div>

      {/* Audience votes row - only show if there are votes */}
      {hasAudienceVotes && (
        <InlineAudienceVotes results={results} colors={colors} />
      )}
    </div>
  );
}

/**
 * Collapsible event group containing multiple outcomes
 */
function EventGroup({ event, onVote, getVote, submitting, allResults }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(true);

  // Get outcomes to display (limit to top 10 for performance)
  const displayOutcomes = event.outcomes.slice(0, 10);
  const hasMore = event.outcomes.length > 10;

  return (
    <div style={{
      marginBottom: '16px',
    }}>
      {/* Event Header - Collapsible */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: expanded ? '12px 12px 0 0' : '12px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <div style={{
            fontFamily: 'Bebas Neue',
            fontSize: '18px',
            color: colors.text,
            letterSpacing: '0.02em',
          }}>
            {event.title}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textMuted,
            marginTop: '2px',
          }}>
            {event.outcomes.length} outcomes • {formatVolume(event.totalVolume)} volume
          </div>
        </div>
        <span style={{
          fontSize: '20px',
          color: colors.textMuted,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>
          ▼
        </span>
      </button>

      {/* Outcomes List */}
      {expanded && (
        <div style={{
          padding: '12px',
          backgroundColor: colors.surfaceAlt,
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${colors.border}`,
          borderTop: 'none',
        }}>
          {displayOutcomes.map((outcome, idx) => (
            <OutcomeRow
              key={outcome.slug || idx}
              outcome={outcome}
              onVote={onVote}
              userVote={getVote(outcome.slug)}
              submitting={submitting}
              results={allResults?.[outcome.slug]}
            />
          ))}
          {hasMore && (
            <div style={{
              textAlign: 'center',
              padding: '8px',
              fontSize: '12px',
              color: colors.textMuted,
            }}>
              +{event.outcomes.length - 10} more outcomes
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * My Votes tab - shows individual voted outcomes with affiliate conversion
 */
function MyVotesCard({ outcome, userVote, results, affiliateUrl, provider }) {
  const { colors } = useTheme();
  // Pass vote direction to get correct payout calculation
  const potentialPayout = calculatePayout(userVote.priceAtVote, userVote.vote, 100);

  // Calculate the effective odds for display
  const effectiveOdds = userVote.vote === 'no'
    ? formatPrice(1 - userVote.priceAtVote)
    : formatPrice(userVote.priceAtVote);

  const hasAudienceVotes = results && results.total > 0;

  // Provider-specific labels and URLs
  const isKalshi = provider === 'kalshi';
  const providerName = isKalshi ? 'Kalshi' : 'Polymarket';
  const tradeUrl = isKalshi
    ? `https://kalshi.com/markets/${outcome.eventTicker || outcome.slug}`
    : affiliateUrl || `https://polymarket.com/event/${outcome.slug}`;

  return (
    <div style={{
      backgroundColor: colors.surface,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      border: `1px solid ${colors.border}`,
    }}>
      {/* Outcome name and your prediction */}
      <div style={{
        fontSize: '15px',
        fontWeight: 600,
        color: colors.text,
        marginBottom: '12px',
      }}>
        {outcome.name}
      </div>

      {/* Your prediction */}
      <div style={{
        padding: '8px 10px',
        backgroundColor: colors.surfaceAlt,
        borderRadius: '6px',
        marginBottom: '12px',
        fontSize: '13px',
        color: colors.text,
      }}>
        You predicted <strong style={{ color: userVote.vote === 'yes' ? colors.positive : colors.negative }}>
          {userVote.vote.toUpperCase()}
        </strong> at {effectiveOdds} odds
      </div>

      {/* Market price section */}
      <div style={{
        padding: '10px',
        backgroundColor: colors.surfaceAlt,
        borderRadius: '8px',
        marginBottom: '10px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '6px',
        }}>
          <SourceLabel type="market" colors={colors} />
          <span style={{ fontSize: '11px', color: colors.textMuted }}>
            Current {providerName} price
          </span>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '20px',
          fontWeight: 600,
          color: colors.text,
        }}>
          {formatPrice(outcome.price || 0)}
        </div>
      </div>

      {/* Audience votes section - only show if there are votes */}
      {hasAudienceVotes && (
        <div style={{
          padding: '10px',
          backgroundColor: colors.surfaceAlt,
          borderRadius: '8px',
          marginBottom: '10px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <SourceLabel type="audience" colors={colors} />
            <span style={{ fontSize: '11px', color: colors.textMuted }}>
              {results.total} votes from our audience
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px',
            fontSize: '12px',
            color: colors.text,
          }}>
            <span>{results.yesPercent}% Yes</span>
            <span>{results.noPercent}% No</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: colors.negative,
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${results.yesPercent}%`,
              backgroundColor: colors.positive,
            }} />
          </div>
        </div>
      )}

      {/* Provider hypothetical - NOT actual betting */}
      <div style={{
        padding: '12px',
        backgroundColor: colors.primary + '10',
        borderRadius: '8px',
        border: `1px solid ${colors.primary}30`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '6px',
        }}>
          <SourceLabel type="market" colors={colors} />
          <span style={{
            fontSize: '11px',
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Hypothetical return
          </span>
        </div>
        <div style={{
          fontSize: '13px',
          color: colors.text,
          marginBottom: '10px',
          lineHeight: 1.4,
        }}>
          Based on {providerName} odds, a <strong>$100</strong> position on{' '}
          <strong style={{ color: userVote.vote === 'yes' ? colors.positive : colors.negative }}>
            {userVote.vote.toUpperCase()}
          </strong>{' '}
          would return <strong style={{ color: colors.accent }}>${potentialPayout}</strong> if correct.
        </div>
        <a
          href={tradeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '10px 14px',
            backgroundColor: colors.primary,
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          Trade on {providerName} →
        </a>
      </div>
    </div>
  );
}

/**
 * Extract selected event IDs from broadcast state zones
 */
function extractSelectedEventIds(zones) {
  const eventIds = new Set();

  // Helper to add event ID from content
  const addFromContent = (content) => {
    if (!content) return;

    // Single event
    if (content.event?.id) {
      eventIds.add(content.event.id);
    }

    // Multiple events
    if (content.events) {
      for (const e of content.events) {
        if (e?.id) eventIds.add(e.id);
      }
    }

    // Featured layout
    if (content.featured?.id) {
      eventIds.add(content.featured.id);
    }
    if (content.secondary) {
      for (const e of content.secondary) {
        if (e?.id) eventIds.add(e.id);
      }
    }

    // Rotation
    if (content.rotation?.events) {
      for (const e of content.rotation.events) {
        if (e?.id) eventIds.add(e.id);
      }
    }
  };

  // Check all zones
  if (zones) {
    addFromContent(zones.main?.content);
    addFromContent(zones.sidebar?.content);
    addFromContent(zones.lowerThird?.content);
    addFromContent(zones.ticker?.content);
    addFromContent(zones.playlist?.content);
  }

  return eventIds;
}

function VoteContent() {
  const { colors } = useTheme();
  const { events, loading } = useEvents({ refreshInterval: 30000 });
  const { state: broadcastState } = useBroadcastSync({ isController: false });
  const { submitVote, hasVoted, getVote, submitting, error, clearError, votedMarkets } = useVoting();
  const [activeTab, setActiveTab] = useState('selected');
  const [config, setConfig] = useState(null);
  const [allResults, setAllResults] = useState({});

  // Fetch config
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig)
      .catch(console.error);
  }, []);

  // Fetch all vote results for display
  useEffect(() => {
    const fetchResults = () => {
      fetch('/api/results')
        .then(res => res.json())
        .then(data => setAllResults(data.results || {}))
        .catch(console.error);
    };
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  // Extract selected event IDs from broadcast state
  const selectedEventIds = useMemo(() => {
    return extractSelectedEventIds(broadcastState.zones);
  }, [broadcastState.zones]);

  // Filter events to only show selected ones
  const selectedEvents = useMemo(() => {
    if (selectedEventIds.size === 0) {
      // No events selected - show message, don't fall back to all
      return [];
    }
    return events.filter(e => selectedEventIds.has(e.id));
  }, [events, selectedEventIds]);

  // Filter and sort events based on active tab
  const filteredEvents = useMemo(() => {
    switch (activeTab) {
      case 'selected':
        // Selected events sorted by volume
        return [...selectedEvents].sort((a, b) => b.totalVolume - a.totalVolume);
      case 'myVotes':
        // Return events that have outcomes the user voted on
        return [];  // Handled separately below
      default:
        return selectedEvents;
    }
  }, [selectedEvents, activeTab]);

  // For My Votes tab, get voted outcomes with their event info
  const votedOutcomes = useMemo(() => {
    if (activeTab !== 'myVotes') return [];

    const votedSlugs = Object.keys(votedMarkets);
    const outcomes = [];

    // Search through ALL events (not just selected) for user's votes
    for (const event of events) {
      for (const outcome of event.outcomes) {
        if (votedSlugs.includes(outcome.slug)) {
          outcomes.push({
            ...outcome,
            eventTitle: event.title,
            userVote: votedMarkets[outcome.slug],
          });
        }
      }
    }

    return outcomes;
  }, [events, votedMarkets, activeTab]);

  const handleVote = async (slug, vote, price) => {
    clearError();
    await submitVote(slug, vote, price);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.surfaceAlt,
      fontFamily: 'Source Sans 3, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.surface,
        padding: '16px',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontFamily: 'Bebas Neue',
            fontSize: '24px',
            color: colors.text,
            margin: 0,
          }}>
            {config?.siteName || 'Market Pulse'}
          </h1>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: colors.negative,
            animation: 'pulse 2s infinite',
          }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: '56px',
        zIndex: 10,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? colors.primary : colors.textMuted,
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${colors.primary}` : '2px solid transparent',
              fontFamily: 'Source Sans 3',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          margin: '16px',
          padding: '12px',
          backgroundColor: colors.negative + '20',
          borderRadius: '8px',
          color: colors.negative,
          textAlign: 'center',
        }}>
          {error}
          <button
            onClick={clearError}
            style={{
              marginLeft: '12px',
              background: 'none',
              border: 'none',
              color: colors.negative,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {loading && events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: colors.textMuted,
          }}>
            Loading markets...
          </div>
        ) : activeTab === 'myVotes' ? (
          // My Votes Tab - Individual outcome cards
          votedOutcomes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: colors.textMuted,
            }}>
              You haven't voted on any markets yet
            </div>
          ) : (
            votedOutcomes.map((outcome, idx) => (
              <MyVotesCard
                key={outcome.slug || idx}
                outcome={outcome}
                userVote={outcome.userVote}
                results={allResults[outcome.slug]}
                affiliateUrl={config?.affiliateUrl}
                provider={config?.provider}
              />
            ))
          )
        ) : (
          // Selected Markets - Event groups
          filteredEvents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: colors.textMuted,
            }}>
              <div style={{ marginBottom: '8px', fontSize: '16px' }}>
                No markets selected yet
              </div>
              <div style={{ fontSize: '13px' }}>
                Markets will appear here once they're assigned in the control panel
              </div>
            </div>
          ) : (
            filteredEvents.map(event => (
              <EventGroup
                key={event.id}
                event={event}
                onVote={handleVote}
                getVote={getVote}
                submitting={submitting}
                allResults={allResults}
              />
            ))
          )
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export function Vote() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig)
      .catch(console.error);
  }, []);

  return (
    <ThemeProvider defaultTheme={config?.defaultTheme || 'default'}>
      <VoteContent />
    </ThemeProvider>
  );
}

export default Vote;
