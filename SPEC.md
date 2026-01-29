# Market Pulse — Technical Specification v2.0

## Executive Summary

Market Pulse is a modular broadcast graphics system for displaying live prediction market data as OBS overlays. The system is designed to:

1. **Pull data from multiple providers** (Polymarket, Kalshi) via a unified abstraction
2. **Generate editorial content** algorithmically (biggest movers, sentiment gaps, etc.)
3. **Capture audience sentiment** via a voting system with affiliate conversion
4. **Display beautifully** with themeable broadcast graphics
5. **Give operators full control** via a dedicated control panel

The architecture separates **data** from **presentation**, allowing the same frontend to display any market category from any provider.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Service Layer](#2-data-service-layer)
3. [Provider Abstraction](#3-provider-abstraction)
4. [Editorial Engine](#4-editorial-engine)
5. [Voting System](#5-voting-system)
6. [Presentation Layer](#6-presentation-layer)
7. [Control Panel](#7-control-panel)
8. [Vote Companion App](#8-vote-companion-app)
9. [API Reference](#9-api-reference)
10. [Configuration & Deployment](#10-configuration--deployment)
11. [Data Contracts](#11-data-contracts)
12. [Implementation Phases](#12-implementation-phases)

---

## 1. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MARKET PULSE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      DATA SERVICE LAYER                           │   │
│  │                                                                    │   │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │   │
│  │   │ Polymarket  │   │   Kalshi    │   │   Future    │  PROVIDERS │   │
│  │   │   Adapter   │   │   Adapter   │   │   Adapter   │            │   │
│  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘            │   │
│  │          └────────────┬────┴───────────┬─────┘                    │   │
│  │                       ▼                                            │   │
│  │          ┌────────────────────────┐                               │   │
│  │          │   Normalized Markets   │  Unified data contract        │   │
│  │          └───────────┬────────────┘                               │   │
│  │                      │                                             │   │
│  │          ┌───────────▼────────────┐   ┌─────────────┐            │   │
│  │          │   Editorial Engine     │◄──│  Supabase   │  VOTING    │   │
│  │          │   (9 Themes)           │   │  (Votes)    │            │   │
│  │          └───────────┬────────────┘   └─────────────┘            │   │
│  │                      │                                             │   │
│  │          ┌───────────▼────────────┐                               │   │
│  │          │      REST API          │                               │   │
│  │          │  /markets /editorial   │                               │   │
│  │          └───────────┬────────────┘                               │   │
│  │                      │                                             │   │
│  └──────────────────────┼───────────────────────────────────────────┘   │
│                         │                                                │
│  ┌──────────────────────▼───────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                             │   │
│  │                                                                    │   │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │   │
│  │   │  Broadcast  │   │    Vote     │   │   Control   │   APPS     │   │
│  │   │  (1920x1080)│   │  Companion  │   │    Panel    │            │   │
│  │   └─────────────┘   └─────────────┘   └─────────────┘            │   │
│  │                                                                    │   │
│  │   ┌─────────────────────────────────────────────────────────┐    │   │
│  │   │  6 Layout Zones  │  Theme System  │  Animation Engine   │    │   │
│  │   └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Provider Agnostic** — Same frontend works with Polymarket, Kalshi, or any future source (swappable via config)
2. **Configuration Driven** — Category, filters, and branding set via environment variables
3. **Editorial Intelligence** — 9 algorithmic themes generate compelling content
4. **Audience Participation** — Voting creates "Market vs Crowd" narrative tension with affiliate conversion
5. **Broadcast Ready** — Transparent backgrounds, OBS-optimized, professional animations
6. **Operator Control** — Dedicated control panel for zone visibility and content assignment

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20+ |
| **Framework** | React 19 (presentation), Express/Vercel Functions (API) |
| **Styling** | CSS-in-JS with theme context |
| **Database** | Supabase PostgreSQL (voting) |
| **Deployment** | Vercel (serverless) |
| **Build** | Vite |

### Project Structure

```
market-pulse/
├── api/                          # Data Service (Vercel serverless)
│   ├── markets.js                # GET /api/markets
│   ├── editorial.js              # GET /api/editorial
│   ├── events.js                 # GET /api/events (grouped)
│   ├── prices/[tokenId].js       # GET /api/prices/:tokenId
│   ├── vote.js                   # POST /api/vote
│   ├── results.js                # GET /api/results
│   ├── state.js                  # GET/POST /api/state (control panel sync)
│   └── config.js                 # GET /api/config
│
├── lib/                          # Shared modules
│   ├── providers/                # Provider adapters
│   │   ├── index.js              # Factory: getProvider()
│   │   ├── polymarket.js         # Polymarket implementation
│   │   ├── kalshi.js             # Kalshi implementation (Phase 2)
│   │   └── types.js              # TypeScript interfaces
│   ├── editorial/                # Editorial engine
│   │   ├── index.js              # calculateEditorial()
│   │   ├── themes.js             # 9 theme algorithms
│   │   └── copy.js               # Editorial copy variations
│   ├── transformers.js           # Data normalization
│   ├── formatters.js             # Price/volume formatting
│   └── config.js                 # Environment config loader
│
├── src/                          # Presentation Layer (React)
│   ├── components/
│   │   ├── zones/                # 6 layout zones
│   │   │   ├── Header.jsx
│   │   │   ├── Main.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LowerThird.jsx
│   │   │   ├── BottomCorner.jsx
│   │   │   ├── Ticker.jsx
│   │   │   └── index.js
│   │   ├── content/              # Content types (assignable to zones)
│   │   │   ├── SingleMarket.jsx  # Hero market display
│   │   │   ├── MarketList.jsx    # Ranked market list
│   │   │   ├── EditorialCard.jsx # Themed editorial content
│   │   │   ├── EventGroup.jsx    # All outcomes for one event
│   │   │   └── index.js
│   │   ├── ui/                   # Reusable components
│   │   │   ├── OutcomeBar.jsx
│   │   │   ├── Sparkline.jsx
│   │   │   ├── QRCode.jsx
│   │   │   ├── LiveIndicator.jsx
│   │   │   ├── Countdown.jsx
│   │   │   └── index.js
│   │   └── ControlPanel/
│   │       ├── index.jsx         # Main control panel
│   │       ├── ZoneToggles.jsx   # Zone visibility controls
│   │       ├── ContentLibrary.jsx # Content type selector
│   │       ├── ThemeSwitcher.jsx # Theme selection
│   │       ├── MarketPinner.jsx  # Pin specific markets
│   │       └── Preview.jsx       # Live preview pane
│   ├── layouts/
│   │   ├── BroadcastLayout.jsx
│   │   └── index.js
│   ├── themes/
│   │   ├── index.jsx             # ThemeContext + ThemeProvider
│   │   └── themes.js             # 3-5 built-in themes
│   ├── hooks/
│   │   ├── useMarketData.js      # Data fetching hook
│   │   ├── useEditorial.js       # Editorial content hook
│   │   ├── useVoting.js          # Vote state management
│   │   ├── useAnimation.js       # Zone state machine
│   │   ├── useTheme.js           # Theme context hook
│   │   └── useBroadcastSync.js   # Control panel ↔ broadcast sync
│   ├── pages/
│   │   ├── Broadcast.jsx         # /broadcast - OBS capture target
│   │   ├── Control.jsx           # /control - Operator control panel
│   │   └── Vote.jsx              # /vote - Mobile companion
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
│   └── assets/
│       └── {deployment_id}/      # Deployment-specific assets (logos, etc.)
│
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## 2. Data Service Layer

### Overview

The data service is responsible for:

1. **Fetching** raw data from configured provider (Polymarket/Kalshi)
2. **Normalizing** data into a unified format
3. **Filtering** by category, event terms, and blacklist
4. **Pre-fetching** sparkline price history for all markets
5. **Calculating** editorial themes
6. **Merging** crowd vote data
7. **Exposing** clean REST endpoints

### Data Flow

```
Provider API → Adapter → Normalizer → Filter → Price History Pre-fetch
                                         ↓
                               Editorial Engine ← Supabase (votes)
                                         ↓
                                   API Response
```

### Caching Strategy

| Data Type | Cache Duration | Invalidation |
|-----------|---------------|--------------|
| Market data | 30 seconds | On next request after TTL |
| Editorial themes | 30 seconds | Recalculated with market data |
| Vote results | 5 seconds | On new vote |
| Price history | 5 minutes | Time-based |
| Config | Never (static) | Deployment |

**Note:** 30-second cache latency is acceptable for broadcast contexts where some delay is tolerable.

### Error Handling

| Scenario | Behavior |
|----------|----------|
| Provider API down | Return cached data (no visual indication to viewers) |
| Provider rate limited | Exponential backoff, return cached |
| Supabase unavailable | Voting disabled, skip crowd-dependent editorial themes |
| Invalid config | Fail fast on startup with clear error |

### Graceful Degradation

When Supabase is unavailable, the following editorial themes are **skipped** from rotation (not shown with empty states):
- Sentiment Gap
- Crowd Favorites
- Most Engaged

The remaining 6 themes continue to rotate normally.

---

## 3. Provider Abstraction

### Overview

The provider abstraction enables **swappability** — the ability to change data sources by updating a single environment variable. This is NOT about aggregating multiple providers simultaneously; each deployment uses exactly one provider at a time.

### Provider Interface

Each provider adapter must implement this interface:

```typescript
interface MarketProvider {
  // Unique identifier
  id: string;  // 'polymarket' | 'kalshi'

  // Fetch all markets matching filters (includes price history pre-fetch)
  fetchMarkets(filters: FilterConfig): Promise<NormalizedMarket[]>;

  // Fetch price history for sparklines
  fetchPriceHistory(tokenId: string, interval: string): Promise<PricePoint[]>;

  // Provider-specific market URL (for affiliate links)
  getMarketUrl(market: NormalizedMarket): string;

  // Provider-specific outcome URL
  getOutcomeUrl(market: NormalizedMarket, outcomeIndex: number): string;

  // Check if market is resolved and get outcome
  checkResolution(market: NormalizedMarket): Promise<ResolutionStatus>;
}

interface FilterConfig {
  category: string;           // 'sports' | 'politics' | 'crypto' | 'entertainment'
  eventFilters: string[];     // ['nfl', 'super-bowl', 'afc']
  blacklist: string[];        // ['pro-bowl', 'bowling'] - terms to exclude
  activeOnly: boolean;        // Only non-closed markets
  minVolume?: number;         // Phase 2: minimum volume threshold
  maxResolutionDays?: number; // Phase 2: max days until resolution
}

interface ResolutionStatus {
  resolved: boolean;
  outcome?: string;           // 'yes' | 'no' | outcome name
  resolvedAt?: string;        // ISO 8601
}
```

### Polymarket Adapter

**API Endpoints Used:**

| Purpose | Endpoint |
|---------|----------|
| List events | `GET https://gamma-api.polymarket.com/events?active=true&closed=false` |
| Event details | `GET https://gamma-api.polymarket.com/events?slug={slug}` |
| Price history | `GET https://clob.polymarket.com/prices-history?market={tokenId}&interval={interval}&fidelity={fidelity}` |

**Fetching Strategy:**

```javascript
// 1. Fetch all active events
const events = await fetch('gamma-api.polymarket.com/events?active=true&closed=false&limit=200');

// 2. Filter events by configured terms (excluding blacklist)
const matchingEvents = events.filter(event => {
  const title = event.title.toLowerCase();
  const matchesFilter = filters.eventFilters.some(term =>
    title.includes(term.toLowerCase())
  );
  const matchesBlacklist = filters.blacklist.some(term =>
    title.includes(term.toLowerCase())
  );
  return matchesFilter && !matchesBlacklist;
});

// 3. Fetch full market data for each event (parallel)
const markets = await Promise.all(
  matchingEvents.map(event => fetchEventMarkets(event.slug))
);

// 4. Normalize to unified format
const normalizedMarkets = markets.flat().map(normalizePolymarketData);

// 5. Pre-fetch sparkline price history for all markets (parallel)
await Promise.all(
  normalizedMarkets.map(market => prefetchPriceHistory(market.tokenIds[0]))
);

return normalizedMarkets;
```

**Raw → Normalized Mapping:**

| Polymarket Field | Normalized Field |
|------------------|------------------|
| `id` | `id` |
| `slug` | `slug` |
| `question` | `question` |
| `groupItemTitle` | `outcomes[0].name` (for group markets) |
| `outcomePrices[0]` | `outcomes[0].price` |
| `oneDayPriceChange` | `outcomes[0].change24h` |
| `oneWeekPriceChange` | `outcomes[0].change7d` |
| `volume` | `volume` |
| `volume24hr` | `volume24h` |
| `liquidity` | `liquidity` |
| `events[0].title` | `event.title` |
| `clobTokenIds` | `tokenIds` |

### Multi-Outcome Markets

Markets with multiple outcomes (e.g., "Super Bowl Winner" with 30+ teams) are treated as **separate markets** — each outcome becomes its own NormalizedMarket entry. This allows:

- Each outcome to appear independently in editorial themes
- Individual voting on each outcome
- Consistent data model across binary and multi-outcome markets

### Kalshi Adapter (Phase 2)

```typescript
// Placeholder for Phase 2 implementation
class KalshiAdapter implements MarketProvider {
  id = 'kalshi';

  async fetchMarkets(filters: FilterConfig): Promise<NormalizedMarket[]> {
    // TODO: Implement Kalshi API integration
    // API Docs: https://trading-api.readme.io/reference/getmarkets
    throw new Error('Kalshi adapter not yet implemented');
  }
}
```

---

## 4. Editorial Engine

### Overview

The editorial engine transforms raw market data into compelling content by identifying markets that match specific narrative criteria. Each "theme" represents a story angle.

### 9 Editorial Themes

#### Theme 1: Big Mover

**Story:** "This market is moving fast — something's happening"

| Criteria | Value |
|----------|-------|
| Filter | `abs(change24h) > 0.02` (2%) |
| Sort | By absolute change (descending) |
| Limit | Top 10, rotate through |

```javascript
function findBigMovers(markets) {
  return markets
    .filter(m => Math.abs(m.outcomes[0].change24h) > 0.02)
    .sort((a, b) => Math.abs(b.outcomes[0].change24h) - Math.abs(a.outcomes[0].change24h))
    .slice(0, 10);
}
```

**Copy Variations:**
- "Surging {direction} {change}% in 24 hours"
- "Sharp movement as {outcome} odds shift"
- "Market reacts: {change}% swing today"

---

#### Theme 2: Debate Fuel

**Story:** "This one's a coin flip — perfect for discussion"

| Criteria | Value |
|----------|-------|
| Filter | Price within 15% of 50% (`0.35 ≤ price ≤ 0.65`) |
| Sort | By volume (descending) |
| Limit | Top 8, rotate through |

```javascript
function findDebateFuel(markets) {
  return markets
    .filter(m => {
      const price = m.outcomes[0].price;
      return price >= 0.35 && price <= 0.65;
    })
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);
}
```

**Copy Variations:**
- "The market can't decide — can you?"
- "Split down the middle at {price}%"
- "Too close to call: {outcome} vs the field"

---

#### Theme 3: Sentiment Gap

**Story:** "The crowd disagrees with the market — who's right?"

| Criteria | Value |
|----------|-------|
| Filter | `abs(crowdVote - marketPrice) > 0.05` (5% gap) |
| Sort | By gap size (descending) |
| Limit | Top 8, rotate through |
| Requires | Crowd vote data from Supabase |

```javascript
function findSentimentGaps(markets, crowdVotes) {
  return markets
    .filter(m => {
      const crowdVote = crowdVotes[m.slug];
      if (crowdVote === undefined) return false;
      const gap = Math.abs(m.outcomes[0].price - crowdVote);
      return gap > 0.05;
    })
    .map(m => ({
      ...m,
      crowdVote: crowdVotes[m.slug],
      gap: Math.abs(m.outcomes[0].price - crowdVotes[m.slug])
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 8);
}
```

**Copy Variations:**
- "Market says {marketPrice}%, you say {crowdVote}%"
- "{gap}% gap between traders and fans"
- "Who knows better — Wall Street or the crowd?"

**Note:** No minimum vote threshold required. Vote counts are displayed so viewers can judge significance themselves.

---

#### Theme 4: Longshot Watch

**Story:** "Low odds but gaining momentum — potential upset?"

| Criteria | Value |
|----------|-------|
| Filter | `price < 0.15` AND `price > 0.01` AND `change24h > 0.005` |
| Sort | By change24h (descending) |
| Limit | Top 8, rotate through |

```javascript
function findLongshotWatch(markets) {
  return markets
    .filter(m => {
      const price = m.outcomes[0].price;
      const change = m.outcomes[0].change24h;
      return price < 0.15 && price > 0.01 && change > 0.005;
    })
    .sort((a, b) => b.outcomes[0].change24h - a.outcomes[0].change24h)
    .slice(0, 8);
}
```

**Copy Variations:**
- "Longshot alert: {outcome} climbing"
- "{multiplier}x potential payout if this hits"
- "Dark horse gaining ground at {price}%"

---

#### Theme 5: Crowd Favorites

**Story:** "The audience is confident about this one"

| Criteria | Value |
|----------|-------|
| Filter | Crowd conviction ≥ 85% (either direction) |
| Sort | By conviction (descending) |
| Limit | Top 8, rotate through |
| Requires | Crowd vote data from Supabase |

```javascript
function findCrowdFavorites(markets, crowdVotes) {
  return markets
    .filter(m => {
      const crowdVote = crowdVotes[m.slug];
      if (crowdVote === undefined) return false;
      const conviction = Math.max(crowdVote, 1 - crowdVote);
      return conviction >= 0.85;
    })
    .map(m => {
      const crowdVote = crowdVotes[m.slug];
      return {
        ...m,
        crowdVote,
        conviction: Math.max(crowdVote, 1 - crowdVote),
        crowdSaysYes: crowdVote > 0.5
      };
    })
    .sort((a, b) => b.conviction - a.conviction)
    .slice(0, 8);
}
```

**Copy Variations:**
- "Crowd consensus: {conviction}% say {direction}"
- "The people have spoken — {outcome} is the pick"
- "Overwhelming audience confidence at {conviction}%"

---

#### Theme 6: Volume Surge

**Story:** "Money is pouring into this market"

| Criteria | Value |
|----------|-------|
| Filter | `volume24h > $10,000` AND `volume24h / totalVolume > 0.08` (8%) |
| Sort | By volume24h (descending) |
| Limit | Top 8, rotate through |

```javascript
function findVolumeSurge(markets) {
  return markets
    .filter(m => {
      const vol24h = m.volume24h;
      const totalVol = m.volume;
      return vol24h > 10000 && totalVol > 0 && (vol24h / totalVol) > 0.08;
    })
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 8);
}
```

**Copy Variations:**
- "${volume24h} traded in last 24 hours"
- "Volume spike: {percentage}% of all-time volume today"
- "Money talks — big bets flowing into {outcome}"

---

#### Theme 7: Fading Fast

**Story:** "This favorite is losing ground"

| Criteria | Value |
|----------|-------|
| Filter | `change24h < -0.02` (dropped 2%+) |
| Sort | By change24h (ascending, most negative first) |
| Limit | Top 10, rotate through |

```javascript
function findFadingFast(markets) {
  return markets
    .filter(m => m.outcomes[0].change24h < -0.02)
    .sort((a, b) => a.outcomes[0].change24h - b.outcomes[0].change24h)
    .slice(0, 10);
}
```

**Copy Variations:**
- "Fading: {outcome} drops {change}%"
- "Confidence crumbling — down {change}% today"
- "The slide continues: {outcome} losing support"

---

#### Theme 8: Most Engaged

**Story:** "Your audience cares about this one"

| Criteria | Value |
|----------|-------|
| Filter | Has crowd votes |
| Sort | By total votes (descending), then by volume |
| Limit | Top 8, rotate through |
| Requires | Crowd vote data from Supabase |

```javascript
function findMostEngaged(markets, crowdVotes, voteCounts) {
  return markets
    .filter(m => crowdVotes[m.slug] !== undefined)
    .map(m => ({
      ...m,
      crowdVote: crowdVotes[m.slug],
      voteCount: voteCounts[m.slug]?.total || 0
    }))
    .sort((a, b) => b.voteCount - a.voteCount || b.volume - a.volume)
    .slice(0, 8);
}
```

**Copy Variations:**
- "{voteCount} votes and counting"
- "Fan favorite: high engagement on {outcome}"
- "Your audience is watching this one closely"

---

#### Theme 9: Fresh Market (Bonus)

**Story:** "New market just opened — get in early"

| Criteria | Value |
|----------|-------|
| Filter | Created within last 48 hours |
| Sort | By creation time (newest first) |
| Limit | Top 5 |

```javascript
function findFreshMarkets(markets) {
  const cutoff = Date.now() - (48 * 60 * 60 * 1000);
  return markets
    .filter(m => new Date(m.createdAt).getTime() > cutoff)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
}
```

---

### Editorial Rotation

The broadcast frontend cycles through editorial themes:

```javascript
const EDITORIAL_ROTATION = [
  { theme: 'bigMover', duration: 12000 },
  { theme: 'debateFuel', duration: 10000 },
  { theme: 'sentimentGap', duration: 12000 },   // Skipped if no crowd data
  { theme: 'longshotWatch', duration: 10000 },
  { theme: 'crowdFavorite', duration: 10000 },  // Skipped if no crowd data
  { theme: 'volumeSurge', duration: 10000 },
  { theme: 'fadingFast', duration: 10000 },
  { theme: 'mostEngaged', duration: 10000 },    // Skipped if no crowd data
];

// Each theme also rotates through its qualifying markets
// e.g., bigMover cycles through top 10 movers, one every 12 seconds
```

---

## 5. Voting System

### Overview

The voting system captures audience sentiment, enabling:

1. **"Market vs Crowd" narrative** — Editorial tension when opinions differ
2. **Engagement** — Viewers participate rather than passively watch
3. **Affiliate conversion** — "You voted YES and it won! If you'd bet $100, you'd have $250. Try Polymarket →"

### Database Schema (Supabase)

```sql
-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id TEXT NOT NULL,          -- 'nfl-pulse', 'politics-pulse'
  voter_token TEXT NOT NULL,            -- Anonymous client token (localStorage)
  market_slug TEXT NOT NULL,            -- Market identifier
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
  price_at_vote DECIMAL(5,4) NOT NULL,  -- Market price when vote was cast (for payout calc)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate votes
  UNIQUE(deployment_id, voter_token, market_slug)
);

-- Aggregates view (for fast reads)
CREATE VIEW vote_aggregates AS
SELECT
  deployment_id,
  market_slug,
  COUNT(*) FILTER (WHERE vote = 'yes') as yes_count,
  COUNT(*) FILTER (WHERE vote = 'no') as no_count,
  COUNT(*) as total_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE vote = 'yes') / NULLIF(COUNT(*), 0)) as yes_percent,
  ROUND(100.0 * COUNT(*) FILTER (WHERE vote = 'no') / NULLIF(COUNT(*), 0)) as no_percent
FROM votes
GROUP BY deployment_id, market_slug;

-- Index for fast lookups
CREATE INDEX idx_votes_deployment_market ON votes(deployment_id, market_slug);
CREATE INDEX idx_votes_voter ON votes(deployment_id, voter_token);
```

### Vote Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Mobile    │     │     API      │     │   Supabase   │
│  Vote App    │────▶│  /api/vote   │────▶│    votes     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                          │
       │ localStorage:                            │
       │ - voterToken                             │
       │ - votedMarkets{}                         ▼
       │                                  ┌──────────────┐
       │                                  │  Aggregates  │
       │                                  │    View      │
       │                                  └──────────────┘
       │                                          │
       │         ┌──────────────┐                 │
       └────────▶│   Companion  │◀────────────────┘
                 │  (Results)   │  /api/results
                 └──────────────┘
```

### Client-Side Tracking

```javascript
// Generate or retrieve anonymous voter token
function getVoterToken() {
  let token = localStorage.getItem('voter_token');
  if (!token) {
    token = 'voter_' + crypto.randomUUID();
    localStorage.setItem('voter_token', token);
  }
  return token;
}

// Track which markets user has voted on (prevents UI re-voting)
function hasVoted(marketSlug) {
  const voted = JSON.parse(localStorage.getItem('voted_markets') || '{}');
  return voted[marketSlug] !== undefined;
}

function markVoted(marketSlug, vote, priceAtVote) {
  const voted = JSON.parse(localStorage.getItem('voted_markets') || '{}');
  voted[marketSlug] = { vote, priceAtVote, timestamp: Date.now() };
  localStorage.setItem('voted_markets', JSON.stringify(voted));
}
```

**Note:** localStorage-based voter tokens are sufficient for this entertainment context. Vote manipulation via incognito sessions is an acceptable tradeoff for reduced friction.

### Resolution Detection

Market resolutions are detected during normal data refresh polling:

```javascript
// During each market data refresh
async function checkForResolutions(markets, previousMarkets) {
  for (const market of markets) {
    const previous = previousMarkets.find(m => m.slug === market.slug);
    if (market.resolved && !previous?.resolved) {
      // Market just resolved - update votes table with resolution
      await markMarketResolved(market.slug, market.resolution);
    }
  }
}
```

### Affiliate Conversion

When a market resolves and the user's vote was correct:

```javascript
function calculateWinnings(priceAtVote, betAmount = 100) {
  // If they voted YES at 32% odds and won
  // Payout = betAmount / priceAtVote = 100 / 0.32 = $312.50
  return (betAmount / priceAtVote).toFixed(2);
}

// Display: "If you'd bet $100, you'd have won $312.50!"
```

The affiliate link is a **generic signup URL** to Polymarket with the affiliate code, not a deep-link to the specific market.

---

## 6. Presentation Layer

### Zone Layout

The broadcast display uses a 6-zone CSS Grid layout at **1920×1080** (fixed resolution):

```
┌─────────────────────────────────────────────────────────┐
│                        HEADER                           │
│            Logo • Live Indicator • Countdown            │
├───────────────────────────────────────┬─────────────────┤
│                                       │                 │
│              MAIN                     │    SIDEBAR      │
│        (Assignable Content)           │  (Assignable)   │
│                                       │                 │
│                                       │                 │
├───────────────────────────────────────┼─────────────────┤
│          LOWER THIRD                  │  BOTTOM CORNER  │
│        (Assignable Content)           │    QR Code      │
├───────────────────────────────────────┴─────────────────┤
│                        TICKER                           │
│              Scrolling Market Summaries                 │
└─────────────────────────────────────────────────────────┘
```

### Content Types

Four content types can be assigned to zones (where they fit):

| Content Type | Description | Best Zones |
|--------------|-------------|------------|
| **Single Market** | Hero display with outcome bars, sparkline, full details | Main, Lower Third |
| **Market List** | Ranked list of markets (data-driven count, up to zone max) | Sidebar, Main |
| **Editorial Card** | Themed content with editorial copy | Lower Third, Main |
| **Event Group** | All outcomes for one event | Main, Sidebar |

Content **auto-adapts** to fit whatever zone it's assigned to. Each zone has a hardcoded maximum item count based on its physical size.

### Special Zones

- **Header**: Fixed content (Logo, Live Indicator, optional Countdown) — not assignable
- **Bottom Corner**: Fixed content (QR Code + vote prompt) — not assignable
- **Ticker**: Special horizontal scrolling behavior — content repeats if sparse

### Grid CSS

```css
.broadcast-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "main sidebar"
    "lowerthird bottomcorner"
    "ticker ticker";
  grid-template-columns: 1fr 320px;
  grid-template-rows: 80px 1fr auto 48px;
  width: 1920px;
  height: 1080px;
  background: transparent;
}

/* Flipped layout variant */
.broadcast-layout.flipped {
  grid-template-areas:
    "header header"
    "sidebar main"
    "bottomcorner lowerthird"
    "ticker ticker";
  grid-template-columns: 320px 1fr;
}
```

### Zone State Machine

Each zone uses a 4-state animation system:

```
'off' ──▶ 'entering' ──▶ 'on' ──▶ 'exiting' ──▶ 'off'
           (animate in)         (animate out)
```

| State | Behavior |
|-------|----------|
| `off` | Not rendered |
| `entering` | Render with entrance animation |
| `on` | Render static |
| `exiting` | Render with exit animation, then transition to `off` |

**Interruption Behavior:** If new content arrives while a zone is mid-transition (e.g., in 'exiting' state), the transition is **interrupted immediately** — cancel the current animation and jump to the new content's 'entering' state.

### Animation Specifications

| Zone | Entrance | Exit | Duration | Easing |
|------|----------|------|----------|--------|
| Header | Slide from top | Slide to top | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Main | Slide from left | Slide to left | 500ms | " |
| Sidebar | Slide from right | Slide to right | 500ms | " |
| Lower Third | Slide from bottom | Slide to bottom | 400ms | " |
| Bottom Corner | Slide from right | Slide to right | 400ms | " |
| Ticker | Slide from bottom | Slide to bottom | 400ms | " |

**Content Animations:**

| Element | Animation |
|---------|-----------|
| Outcome bars | Width transition (0.5s ease-out) |
| Price changes | Flash highlight (green/red) + scale pulse |
| List items | Staggered entrance (80ms delay each) |
| Rankings | FLIP animation on position change (immediate reorder, no debounce) |
| Live indicator | Pulsing red dot (2s infinite) |
| Ticker | Infinite horizontal scroll (30s linear, repeats if sparse content) |
| Sparkline bars | Staggered height growth |

### Sparklines

Sparklines (mini price history charts) appear **only on Single Market (hero) content type**, not in compact list views.

### Theme System

```typescript
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;        // Brand color (borders, accents)
    secondary: string;      // Secondary brand
    tertiary: string;       // Third brand color

    surface: string;        // Card backgrounds (semi-transparent)
    surfaceAlt: string;     // Highlighted backgrounds

    border: string;         // Border color

    text: string;           // Primary text
    textMuted: string;      // Secondary text

    accent: string;         // Highlights, callouts
    positive: string;       // Up arrows, gains (green)
    negative: string;       // Down arrows, losses (red)
  };
}
```

**Fonts (Hardcoded):**

| Purpose | Font |
|---------|------|
| Display/Titles | Bebas Neue |
| Body text | Source Sans 3 |
| Numbers | JetBrains Mono |

**Built-in Themes (3-5):**

| ID | Name | Primary Colors |
|----|------|----------------|
| `default` | Market Pulse | Blue / White / Dark |
| `united-home` | Manchester United | Red / White / Black |
| `seahawks` | Seattle Seahawks | Navy / Green / Silver |
| `dark` | Dark Mode | Charcoal / White / Accent |
| `halloween` | Halloween | Orange / Purple / Black |

### Header Zone

| Element | Behavior |
|---------|----------|
| Logo | Loaded from `public/assets/{deployment_id}/logo.png` |
| Live Indicator | Pulsing red dot |
| Countdown | Optional — shown only if `COUNTDOWN_DATE` env var is set |

---

## 7. Control Panel

### Overview

The control panel (`/control` route) is a **separate page** that remotely controls the broadcast output. Both windows run on the same computer and sync via the browser's BroadcastChannel API.

### Features

1. **Zone Toggles** — Show/hide each of the 6 zones with animated transitions
2. **Content Library** — Select content types and assign them to zones
3. **Theme Switcher** — Change color theme on the fly
4. **Market Pinner** — Search and pin specific markets to guarantee they appear
5. **Live Preview** — Small preview of the broadcast output

### Control Panel Layout

```
┌─────────────────────────────────────────────────────────┐
│  MARKET PULSE CONTROL                    [Theme: ▼]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              LIVE PREVIEW (scaled)               │   │
│  │                                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├──────────────────────┬──────────────────────────────────┤
│   ZONE TOGGLES       │      CONTENT LIBRARY             │
│                      │                                  │
│   [✓] Header         │   ┌──────────────────────────┐  │
│   [✓] Main           │   │ • Single Market          │  │
│   [✓] Sidebar        │   │ • Market List            │  │
│   [ ] Lower Third    │   │ • Editorial Card         │  │
│   [✓] Bottom Corner  │   │ • Event Group            │  │
│   [✓] Ticker         │   └──────────────────────────┘  │
│                      │                                  │
│                      │   Click content, then zone      │
├──────────────────────┴──────────────────────────────────┤
│   PINNED MARKETS                                        │
│   [Search markets...]                                   │
│   • chiefs-super-bowl-winner  [×]                       │
│   • eagles-super-bowl-winner  [×]                       │
└─────────────────────────────────────────────────────────┘
```

### Content Assignment Flow

1. Click a content type in the Content Library
2. Click a zone to assign that content to it
3. Zone animates in with the new content

For **Single Market** content, additional UI appears:
- **Auto-rotate**: Select a rule (Top by volume, Current editorial focus, etc.)
- **Pin specific**: Search box to find and pin a specific market

### State Synchronization

Control panel and broadcast sync via BroadcastChannel API (same-computer only):

```javascript
// Control Panel
const channel = new BroadcastChannel('market-pulse-control');

function updateZoneVisibility(zone, visible) {
  channel.postMessage({ type: 'ZONE_VISIBILITY', zone, visible });
}

function assignContent(zone, contentType, config) {
  channel.postMessage({ type: 'ASSIGN_CONTENT', zone, contentType, config });
}

function setTheme(themeId) {
  channel.postMessage({ type: 'SET_THEME', themeId });
}

// Broadcast
const channel = new BroadcastChannel('market-pulse-control');
channel.onmessage = (event) => {
  switch (event.data.type) {
    case 'ZONE_VISIBILITY':
      setZoneVisible(event.data.zone, event.data.visible);
      break;
    case 'ASSIGN_CONTENT':
      assignZoneContent(event.data.zone, event.data.contentType, event.data.config);
      break;
    case 'SET_THEME':
      setTheme(event.data.themeId);
      break;
  }
};
```

---

## 8. Vote Companion App

### Overview

The vote companion (`/vote` route) is a mobile-friendly page **within the same React app** that allows viewers to:

1. Browse and vote on markets
2. See immediate crowd vote results after voting
3. Track their votes and see affiliate conversion on winning resolved markets

### Layout

```
┌─────────────────────────────────┐
│  NFL MARKET PULSE          🔴   │
├─────────────────────────────────┤
│  [Trending] [New] [My Votes]    │
├─────────────────────────────────┤
│                                 │
│  ▼ Super Bowl LX                │
│  ┌─────────────────────────┐   │
│  │ Chiefs to win           │   │
│  │ Market: 32%             │   │
│  │ [YES]        [NO]       │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Eagles to win           │   │
│  │ Market: 28%             │   │
│  └─────────────────────────┘   │
│                                 │
│  ▼ AFC Championship            │
│  ...                            │
│                                 │
└─────────────────────────────────┘
```

### Tabs

| Tab | Content |
|-----|---------|
| **Trending** | Markets sorted by 24h volume |
| **New** | Recently created markets |
| **My Votes** | Markets the user has voted on (including resolved) |

### Market Grouping

Markets are grouped by their parent event (e.g., "Super Bowl LX" contains all team outcomes). Groups are collapsible.

### Vote Flow

1. User taps YES or NO
2. Vote submitted to `/api/vote` with current market price
3. **Immediate results** shown: "63% Yes / 37% No (232 votes)"
4. Market marked as voted in localStorage

### Error Handling

If Supabase is unavailable when voting:
- Display error message: "Voting temporarily unavailable. Please try again."
- Show retry button
- No optimistic UI — vote must succeed to be counted

**Connectivity:** The companion requires an internet connection. No offline support.

### Affiliate Conversion (My Votes Tab)

For resolved markets where the user voted correctly:

```
┌─────────────────────────────────┐
│ ✓ Chiefs to win      RESOLVED  │
│                                 │
│ You voted YES at 32% odds      │
│ The Chiefs won!                 │
│                                 │
│ ┌─────────────────────────────┐│
│ │ If you'd bet $100,          ││
│ │ you'd have won $312.50!     ││
│ │                             ││
│ │ [Sign up for Polymarket →]  ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

- Only **winning votes** are shown with the conversion CTA
- Losing votes are **not shown** (filtered out)
- Payout calculated from **price at time of vote** (stored in DB)
- Affiliate link goes to generic Polymarket signup with affiliate code

---

## 9. API Reference

### Base URL

```
Production: https://{deployment}.vercel.app/api
Local:      http://localhost:3000/api
```

### Endpoints

#### GET /api/markets

Returns all filtered markets in normalized format with pre-fetched sparkline data.

**Response:**
```json
{
  "markets": [
    {
      "id": "0x...",
      "slug": "chiefs-super-bowl-winner",
      "question": "Will the Chiefs win Super Bowl LX?",
      "outcomes": [
        {
          "name": "Chiefs",
          "price": 0.32,
          "change24h": 0.05,
          "change7d": -0.02,
          "sparkline": [
            { "t": 1705500000, "p": 0.28 },
            { "t": 1705503600, "p": 0.31 }
          ]
        }
      ],
      "volume": 2400000,
      "volume24h": 250000,
      "liquidity": 350000,
      "event": {
        "id": "0x...",
        "title": "Super Bowl LX",
        "category": "sports"
      },
      "tokenIds": ["0x..."],
      "createdAt": "2025-09-01T00:00:00Z",
      "resolvesAt": "2026-02-08T23:59:59Z",
      "resolved": false
    }
  ],
  "meta": {
    "provider": "polymarket",
    "category": "sports",
    "filters": ["nfl", "super-bowl"],
    "blacklist": ["pro-bowl"],
    "count": 127,
    "lastUpdated": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/events

Returns markets grouped by event.

**Response:**
```json
{
  "events": [
    {
      "id": "0x...",
      "title": "Super Bowl LX",
      "outcomes": [
        { "name": "Chiefs", "price": 0.32, "change24h": 0.05, "slug": "chiefs-sb" },
        { "name": "Eagles", "price": 0.28, "change24h": -0.02, "slug": "eagles-sb" },
        { "name": "49ers", "price": 0.18, "change24h": 0.03, "slug": "49ers-sb" }
      ],
      "totalVolume": 50000000,
      "liquidity": 5000000
    }
  ],
  "meta": { ... }
}
```

---

#### GET /api/editorial

Returns all pre-calculated editorial themes in a single response.

**Response:**
```json
{
  "themes": {
    "bigMovers": [ /* NormalizedMarket[] */ ],
    "debateFuel": [ /* NormalizedMarket[] */ ],
    "sentimentGaps": [ /* NormalizedMarket[] with crowdVote, gap */ ],
    "longshotWatch": [ /* NormalizedMarket[] */ ],
    "crowdFavorites": [ /* NormalizedMarket[] with crowdVote, conviction */ ],
    "volumeSurge": [ /* NormalizedMarket[] */ ],
    "fadingFast": [ /* NormalizedMarket[] */ ],
    "mostEngaged": [ /* NormalizedMarket[] with voteCount */ ],
    "freshMarkets": [ /* NormalizedMarket[] */ ]
  },
  "meta": {
    "lastUpdated": "2026-01-18T12:00:00Z",
    "votesIncluded": true
  }
}
```

---

#### GET /api/prices/:tokenId

Returns 7-day price history for sparklines.

**Query Params:**
- `interval`: `1d` | `1w` | `1m` (default: `1w`)
- `fidelity`: Number of data points (default: `360`)

**Response:**
```json
{
  "history": [
    { "t": 1705500000, "p": 0.28 },
    { "t": 1705503600, "p": 0.29 },
    { "t": 1705507200, "p": 0.31 }
  ],
  "tokenId": "0x...",
  "interval": "1w"
}
```

---

#### POST /api/vote

Submit a vote. Stores the market price at vote time for payout calculation.

**Request:**
```json
{
  "voterToken": "voter_abc123",
  "marketSlug": "chiefs-super-bowl-winner",
  "vote": "yes",
  "priceAtVote": 0.32
}
```

**Response:**
```json
{
  "success": true,
  "voteId": "uuid",
  "results": {
    "yes": 145,
    "no": 87,
    "total": 232,
    "yesPercent": 63,
    "noPercent": 37
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Voting temporarily unavailable. Please try again."
}
```

---

#### GET /api/results

Returns aggregated vote results.

**Response:**
```json
{
  "results": {
    "chiefs-super-bowl-winner": {
      "yes": 145,
      "no": 87,
      "total": 232,
      "yesPercent": 63,
      "noPercent": 37
    },
    "eagles-super-bowl-winner": { ... }
  },
  "totalVotes": 5420,
  "marketsWithVotes": 89,
  "lastUpdated": "2026-01-18T12:00:00Z"
}
```

---

#### GET /api/config

Returns current deployment configuration.

**Response:**
```json
{
  "provider": "polymarket",
  "category": "sports",
  "eventFilters": ["nfl", "super-bowl", "afc", "nfc"],
  "blacklist": ["pro-bowl"],
  "siteName": "NFL Market Pulse",
  "countdown": {
    "date": "2026-02-08T18:30:00-05:00",
    "label": "Super Bowl LX"
  },
  "affiliateUrl": "https://polymarket.com/?ref=abc123",
  "refreshIntervals": {
    "data": 60,
    "votes": 5
  }
}
```

---

## 10. Configuration & Deployment

### Environment Variables

```bash
# ═══════════════════════════════════════════════════════════
# PROVIDER CONFIGURATION
# ═══════════════════════════════════════════════════════════

# Which data provider to use (swappable)
PROVIDER=polymarket                    # polymarket | kalshi

# Market category
CATEGORY=sports                        # sports | politics | crypto | entertainment

# Event filter terms (comma-separated, case-insensitive)
EVENT_FILTERS=nfl,super-bowl,afc,nfc,chiefs,eagles,49ers

# Blacklist terms to exclude (comma-separated, case-insensitive)
BLACKLIST=pro-bowl,bowling

# ═══════════════════════════════════════════════════════════
# DISPLAY CONFIGURATION
# ═══════════════════════════════════════════════════════════

# Site branding
SITE_NAME=NFL Market Pulse
DEPLOYMENT_ID=nfl-pulse                # Used for asset folder: public/assets/nfl-pulse/

# Countdown timer (optional - omit to hide)
COUNTDOWN_DATE=2026-02-08T18:30:00-05:00
COUNTDOWN_LABEL=Super Bowl LX

# Default theme
DEFAULT_THEME=default

# ═══════════════════════════════════════════════════════════
# REFRESH INTERVALS (seconds)
# ═══════════════════════════════════════════════════════════

DATA_REFRESH_INTERVAL=60               # Market data refresh
VOTE_REFRESH_INTERVAL=5                # Vote results refresh
HERO_ROTATION_INTERVAL=30              # Hero market rotation
EDITORIAL_ROTATION_INTERVAL=10         # Editorial theme rotation

# ═══════════════════════════════════════════════════════════
# VOTING / SUPABASE
# ═══════════════════════════════════════════════════════════

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# ═══════════════════════════════════════════════════════════
# AFFILIATE
# ═══════════════════════════════════════════════════════════

AFFILIATE_URL=https://polymarket.com/?ref=abc123

# ═══════════════════════════════════════════════════════════
# PROVIDER API URLS (optional overrides)
# ═══════════════════════════════════════════════════════════

POLYMARKET_GAMMA_URL=https://gamma-api.polymarket.com
POLYMARKET_CLOB_URL=https://clob.polymarket.com
KALSHI_API_URL=https://trading-api.kalshi.com

# ═══════════════════════════════════════════════════════════
# PHASE 2: ADVANCED FILTERING (optional)
# ═══════════════════════════════════════════════════════════

# MIN_VOLUME=10000                     # Minimum volume threshold
# MAX_RESOLUTION_DAYS=30               # Only markets resolving within N days
# WHITELIST=market-slug-1,market-slug-2
```

### Deployment-Specific Assets

Assets are stored in a conventional folder structure:

```
public/
└── assets/
    └── {deployment_id}/
        ├── logo.png
        └── favicon.ico
```

The `DEPLOYMENT_ID` environment variable determines which asset folder is used.

### Deployment Model

**One codebase, multiple Vercel projects:**

```
┌─────────────────────────────────────────────────────────────┐
│                    market-pulse (repo)                       │
│                                                              │
│  Same code deployed to multiple Vercel projects:            │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  nfl-pulse       │  │  politics-pulse  │                │
│  │  ─────────────── │  │  ─────────────── │                │
│  │  PROVIDER=poly   │  │  PROVIDER=poly   │                │
│  │  CATEGORY=sports │  │  CATEGORY=politics│               │
│  │  FILTERS=nfl...  │  │  FILTERS=election│                │
│  │  SITE_NAME=NFL.. │  │  SITE_NAME=...   │                │
│  └──────────────────┘  └──────────────────┘                │
│           │                     │                           │
│           ▼                     ▼                           │
│   nfl-pulse.vercel.app  politics-pulse.vercel.app          │
│           │                     │                           │
│           ▼                     ▼                           │
│      YouTube: NFL           YouTube: Politics               │
│      OBS Scene              OBS Scene                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Steps

1. **Create Vercel project** pointing to the market-pulse repo
2. **Configure environment variables** for the deployment
3. **Add deployment assets** to `public/assets/{deployment_id}/`
4. **Deploy** — Vercel builds and deploys automatically
5. **Set up OBS** — Add browser source pointing to `https://{project}.vercel.app/broadcast`
6. **Open control panel** — `https://{project}.vercel.app/control` in another window
7. **Share vote link** — QR code points to `https://{project}.vercel.app/vote`

---

## 11. Data Contracts

### NormalizedMarket

The unified market format that all providers normalize to:

```typescript
interface NormalizedMarket {
  // Identity
  id: string;                    // Provider's market ID
  slug: string;                  // URL-safe identifier
  question: string;              // Full market question

  // Outcomes (always an array, even for binary markets)
  outcomes: Outcome[];

  // Volume & Liquidity
  volume: number;                // Total volume (USD)
  volume24h: number;             // 24-hour volume (USD)
  liquidity: number;             // Current liquidity (USD)

  // Event grouping
  event: {
    id: string;
    title: string;               // "Super Bowl LX"
    category: string;            // "sports"
  };

  // Provider-specific (for price history, deep links)
  tokenIds: string[];
  providerUrl: string;           // Direct link to market on provider

  // Resolution
  resolved: boolean;
  resolution?: 'yes' | 'no' | string;
  resolvedAt?: string;           // ISO 8601

  // Timestamps
  createdAt: string;             // ISO 8601
  resolvesAt?: string;           // ISO 8601 (if known)
}

interface Outcome {
  name: string;                  // "Chiefs", "Yes", etc.
  price: number;                 // 0-1 decimal (0.32 = 32%)
  change24h: number;             // Signed decimal (+0.05 = +5%)
  change7d: number;              // Signed decimal
  tokenId?: string;              // For price history lookup
  sparkline?: PricePoint[];      // Pre-fetched price history (hero views only)
}
```

### GroupedEvent

Markets grouped by their parent event:

```typescript
interface GroupedEvent {
  id: string;
  title: string;                 // "Super Bowl LX"
  category: string;

  outcomes: EventOutcome[];      // Sorted by price (highest first)

  totalVolume: number;
  liquidity: number;
}

interface EventOutcome {
  name: string;                  // "Chiefs"
  price: number;
  change24h: number;
  volume: number;
  slug: string;                  // For voting reference
  marketId: string;
}
```

### EditorialItem

Market with editorial metadata:

```typescript
interface EditorialItem extends NormalizedMarket {
  // Theme-specific additions
  crowdVote?: number;            // 0-1 decimal (from votes)
  gap?: number;                  // Sentiment gap size
  conviction?: number;           // Crowd conviction level
  voteCount?: number;            // Total votes on this market
  crowdSaysYes?: boolean;        // Crowd majority direction

  // Display helpers
  editorialCopy: string;         // Pre-generated copy text
  themeLabel: string;            // "BIG MOVER", "DEBATE FUEL", etc.
  themeColor: string;            // Theme-specific accent color
}
```

### VoteResult

```typescript
interface VoteResult {
  yes: number;                   // Yes vote count
  no: number;                    // No vote count
  total: number;                 // Total votes
  yesPercent: number;            // 0-100 integer
  noPercent: number;             // 0-100 integer
}

interface VoteResults {
  [marketSlug: string]: VoteResult;
}
```

### PriceHistory

```typescript
interface PricePoint {
  t: number;                     // Unix timestamp
  p: number;                     // Price (0-1 decimal)
}

interface PriceHistory {
  history: PricePoint[];
  tokenId: string;
  interval: '1d' | '1w' | '1m';
}
```

### BroadcastState

State shared between control panel and broadcast:

```typescript
interface BroadcastState {
  zones: {
    header: ZoneState;
    main: ZoneState;
    sidebar: ZoneState;
    lowerThird: ZoneState;
    bottomCorner: ZoneState;
    ticker: ZoneState;
  };
  theme: string;                 // Theme ID
  pinnedMarkets: string[];       // Market slugs
}

interface ZoneState {
  visible: boolean;
  content: ContentAssignment | null;
}

interface ContentAssignment {
  type: 'singleMarket' | 'marketList' | 'editorialCard' | 'eventGroup';
  config: {
    // For singleMarket:
    marketSlug?: string;         // Pinned specific market
    autoRule?: 'topVolume' | 'topMover' | 'editorial';

    // For marketList:
    sortBy?: 'volume' | 'change' | 'price';

    // For editorialCard:
    theme?: string;              // Specific theme or 'auto'

    // For eventGroup:
    eventId?: string;
  };
}
```

---

## 12. Implementation Phases

### Phase 1: Full MVP

**Goal:** Complete working system with control panel and affiliate conversion

| Task | Description |
|------|-------------|
| Project setup | Initialize monorepo with Vite + Vercel structure |
| Config system | Environment variable loading with blacklist support |
| Polymarket adapter | Fetch, filter, normalize market data with price history pre-fetch |
| Editorial engine | Implement all 9 theme algorithms |
| API layer | `/markets`, `/events`, `/editorial`, `/prices`, `/vote`, `/results`, `/config` |
| Voting system | Supabase integration with price-at-vote storage |
| Resolution detection | Poll for resolved markets during data refresh |
| Broadcast frontend | 6 zones, 4 content types, animation system |
| Control panel | Zone toggles, content library, theme switcher, market pinner, preview |
| Broadcast sync | BroadcastChannel API for control ↔ broadcast communication |
| Vote companion | Mobile-friendly voting page with tabs (Trending, New, My Votes) |
| Affiliate conversion | "You would have won" display for winning votes |
| Theme system | 3-5 built-in themes |
| Deployment | Vercel config, asset folder convention |

**Test Case:** NFL / Super Bowl markets

**Deliverable:** Fully functional Market Pulse with operator control and affiliate conversion

---

### Phase 2: Multi-Provider & Advanced Filtering

**Goal:** Add Kalshi support and advanced filtering

| Task | Description |
|------|-------------|
| Kalshi adapter | Implement Kalshi API integration |
| Provider switching | Verify seamless provider swap via ENV |
| Volume filtering | `MIN_VOLUME` environment variable |
| Time filtering | `MAX_RESOLUTION_DAYS` filtering |
| Whitelist | Manual market inclusion |

**Deliverable:** Politics deployment on Kalshi (or Polymarket)

---

### Phase 3: Advanced Features

**Goal:** Enhanced editorial and engagement

| Task | Description |
|------|-------------|
| Custom themes | User-created color schemes via ENV or UI |
| Alert system | "Breaking: Market moved 10%+" notifications |
| Historical trends | "This market has moved X% this week" |
| Multi-market comparison | Side-by-side market displays |
| Embed widgets | Shareable market cards for social |

---

## Appendix A: Formatting Utilities

```javascript
// Price: 0.32 → "32%"
function formatPrice(price) {
  return (parseFloat(price) * 100).toFixed(1) + '%';
}

// Change: 0.05 → "+5.0%", -0.02 → "-2.0%"
function formatChange(change) {
  const pct = (parseFloat(change) * 100).toFixed(1);
  return change >= 0 ? '+' + pct + '%' : pct + '%';
}

// Volume: 2400000 → "$2.4M"
function formatVolume(volume) {
  const num = parseFloat(volume) || 0;
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
  return '$' + num.toFixed(0);
}

// Arrow: positive → "▲", negative → "▼"
function getArrow(change) {
  return change >= 0 ? '▲' : '▼';
}

// Color: positive → green, negative → red
function getChangeColor(change, colors) {
  if (change > 0.001) return colors.positive;
  if (change < -0.001) return colors.negative;
  return colors.textMuted;
}

// Multiplier: 0.08 → "12.5x" (potential payout)
function formatMultiplier(price) {
  if (price <= 0) return '∞';
  return (1 / price).toFixed(1) + 'x';
}

// Payout calculation: price 0.32, bet $100 → $312.50
function calculatePayout(priceAtVote, betAmount = 100) {
  if (priceAtVote <= 0) return '∞';
  return (betAmount / priceAtVote).toFixed(2);
}
```

---

## Appendix B: Editorial Copy Templates

Each theme has multiple copy variations for variety:

```javascript
const EDITORIAL_COPY = {
  bigMover: [
    "Surging {direction} {change} in 24 hours",
    "Sharp movement: {outcome} odds shift {change}",
    "Market reacts with {change} swing today",
    "{outcome} {direction} momentum building",
    "Big move alert: {change} in one day"
  ],
  debateFuel: [
    "The market can't decide — can you?",
    "Split down the middle at {price}",
    "Too close to call",
    "Coin flip territory: {price}",
    "Where do you stand?"
  ],
  sentimentGap: [
    "Market says {marketPrice}, you say {crowdVote}",
    "{gap} gap between traders and fans",
    "Who's right — the money or the crowd?",
    "Traders vs fans: {gap} disagreement",
    "The crowd sees it differently"
  ],
  longshotWatch: [
    "Longshot alert: {outcome} climbing",
    "{multiplier} potential payout if this hits",
    "Dark horse gaining ground at {price}",
    "Underdog on the move",
    "Low odds, high potential"
  ],
  crowdFavorite: [
    "Crowd consensus: {conviction}% say {direction}",
    "The people have spoken — {outcome} is the pick",
    "Overwhelming audience confidence",
    "Fan favorite at {conviction}%",
    "The crowd is certain"
  ],
  volumeSurge: [
    "{volume24h} traded in last 24 hours",
    "Volume spike: {percentage}% of all-time today",
    "Money talks — big bets flowing in",
    "Trading frenzy on this market",
    "Volume surge alert"
  ],
  fadingFast: [
    "Fading: {outcome} drops {change}",
    "Confidence crumbling — down {change} today",
    "The slide continues",
    "Losing support fast",
    "Sharp decline in progress"
  ],
  mostEngaged: [
    "{voteCount} votes and counting",
    "Fan favorite: high engagement",
    "Your audience is watching this one",
    "Most voted market today",
    "Hot topic: {voteCount} votes"
  ],
  freshMarket: [
    "New market just opened",
    "Fresh odds available",
    "Just listed — get in early",
    "Brand new market",
    "Opening odds"
  ]
};
```

---

## Appendix C: OBS Setup Guide

### Browser Source Settings

```
URL:         https://{deployment}.vercel.app/broadcast
Width:       1920
Height:      1080
FPS:         30
CSS:         (none required)
```

### Recommended Scene Setup

```
Scene: Market Pulse Broadcast
├── Background (Video/Image)
├── Browser Source: Market Pulse
│   URL: https://nfl-pulse.vercel.app/broadcast
│   Size: 1920x1080
│   Position: 0, 0
└── (Optional) Webcam overlay
```

### Operator Workflow

1. Open OBS with broadcast scene
2. Open control panel in browser: `https://nfl-pulse.vercel.app/control`
3. Use control panel to:
   - Toggle zones on/off
   - Assign content to zones
   - Switch themes
   - Pin important markets
4. Share QR code on screen for viewers to vote

---

*Last Updated: January 2026*
*Version: 2.0*
