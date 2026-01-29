# Market Pulse

Modular broadcast graphics system for displaying live prediction market data as OBS overlays.

## Project Overview

Market Pulse pulls data from prediction market providers (Polymarket, Kalshi), generates editorial content algorithmically, captures audience sentiment via voting, and displays professional broadcast graphics with operator control.

## Architecture

```
market-pulse/
├── api/                    # Vercel serverless functions
│   ├── markets.js          # GET /api/markets
│   ├── editorial.js        # GET /api/editorial
│   ├── events.js           # GET /api/events (filtered) or ?all=true (unfiltered)
│   ├── prices.js           # GET /api/prices?tokenId=xxx&interval=1w
│   ├── vote.js             # POST /api/vote
│   ├── results.js          # GET /api/results
│   └── config.js           # GET /api/config
│
├── lib/                    # Shared modules
│   ├── providers/          # Provider adapters (Polymarket, Kalshi)
│   │   ├── index.js        # Factory: getProvider()
│   │   ├── polymarket.js   # Polymarket implementation
│   │   ├── kalshi.js       # Kalshi implementation
│   │   └── types.js        # TypeScript interfaces
│   ├── editorial/          # Editorial engine (9 themes)
│   │   ├── index.js        # calculateEditorial()
│   │   ├── themes.js       # Theme algorithms
│   │   └── copy.js         # Editorial copy variations
│   ├── transformers.js     # Data normalization
│   ├── formatters.js       # Price/volume formatting
│   └── config.js           # Environment config loader
│
├── src/                    # React presentation layer
│   ├── components/
│   │   ├── zones/          # 6 layout zones (Header, Main, Sidebar, LowerThird, BottomCorner, Ticker)
│   │   ├── content/        # Content types (SingleMarket, MarketList, EditorialCard, EventGroup)
│   │   ├── ui/             # Reusable components (OutcomeBar, Sparkline, QRCode, etc.)
│   │   └── ControlPanel/   # Operator control panel
│   ├── themes/             # Theme system with ThemeContext
│   ├── hooks/              # React hooks (useMarketData, useEditorial, useVoting, etc.)
│   └── pages/              # Broadcast, Control, Vote pages
│
└── public/assets/{deployment_id}/  # Deployment-specific assets
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: React 19 (presentation), Vercel Functions (API)
- **Styling**: CSS-in-JS with theme context
- **Database**: Supabase PostgreSQL (voting)
- **Deployment**: Vercel (serverless)
- **Build**: Vite

## Key Conventions

### Code Style
- Use ES modules (import/export)
- Prefer async/await over .then() chains
- Use JSDoc comments for function documentation
- Keep components small and focused

### Data Contracts
- All market data normalized to `NormalizedMarket` interface
- Prices are 0-1 decimals (0.32 = 32%)
- Changes are signed decimals (+0.05 = +5%)
- Timestamps are ISO 8601 strings

### API Response Format
```javascript
{
  data: { ... },           // Main response data
  meta: {
    provider: 'polymarket',
    lastUpdated: 'ISO8601',
    ...
  }
}
```

### Environment Variables
Provider config uses: `PROVIDER`, `CATEGORY`, `EVENT_FILTERS`, `BLACKLIST`
Display config uses: `SITE_NAME`, `DEPLOYMENT_ID`, `COUNTDOWN_DATE`

Database (server-side):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase publishable/anon key

Database (client-side, for broadcast sync):
- `VITE_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` - Same as SUPABASE_URL
- `VITE_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY

Note: Vite is configured to expose both `VITE_` and `NEXT_PUBLIC_` prefixed env vars (see `vite.config.js` `envPrefix`). This allows compatibility with Vercel's Supabase integration which uses `NEXT_PUBLIC_` convention.

## Editorial Themes

9 algorithmic themes for compelling content:
1. **Big Mover** - Markets with >2% 24h change
2. **Debate Fuel** - Markets at 35-65% (coin flip territory)
3. **Sentiment Gap** - >5% gap between crowd vote and market price
4. **Longshot Watch** - Low odds (<15%) gaining momentum
5. **Crowd Favorites** - >85% crowd conviction
6. **Volume Surge** - High 24h volume relative to total
7. **Fading Fast** - Markets dropping >2%
8. **Most Engaged** - Highest vote counts
9. **Fresh Market** - Created within 48 hours

## Broadcast Layout

6-zone CSS Grid at 1920x1080:
- **Header**: Logo, live indicator, countdown (fixed)
- **Main**: Primary content area (assignable) - Featured layout with trending markets
- **Sidebar**: Secondary content - Default shows "24H Biggest Movers" with FLIP animations
- **Lower Third**: Editorial content rotation (cycles through themes every 12s)
- **Bottom Corner**: QR code for voting (fixed)
- **Ticker**: Scrolling market summaries (special)

### Lower Third Editorial Rotation

The lower third automatically cycles through editorial content from all themes:
- Builds a list of up to 20 markets from themes (bigMovers, debateFuel, etc.)
- Rotates every 12 seconds
- Content switches instantly (no fade animation)
- Shows full market question, animated stat bar, and editorial copy

### Sidebar Big Movers

Default sidebar shows "24H Biggest Movers" from playlist events:
- Displays top 6 markets sorted by absolute price change
- FLIP animations when rankings change (green glow up, red glow down)
- Items distributed evenly with `justify-content: space-between`

### EditorialCard Component

The EditorialCard displays themed content in a two-column broadcast-style lower third:

**Left Column (55%):**
- Theme label (e.g., "BIG MOVER") with theme-specific color
- Full market question (not just outcome name)
- Primary stat with animated bar
- For movers: shows "X% → Y%" format with bar animating from old to new value

**Right Column (40%):**
- Editorial copy (styled italic quote)
- Meta info: volume, vote count

**Font Sizes:**
- Theme label: 16px
- Market title: 26px (clamped to 2 lines)
- Primary stat: 36px
- Secondary stat: 20px
- Editorial copy: 22px
- Meta info: 16px

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run lint             # Run ESLint

# Deployment
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production
```

## Control Panel Features

### Onboarding Tour
Interactive 8-step tour for first-time users:
1. Welcome — Introduction to the control panel
2. Choose Your Markets — How to browse and select
3. Your Broadcast Layout — All zones are automated
4. Secondary Zone — The one place to drag selections
5. Flip Layout — Optional layout mirroring
6. Zone Visibility — Toggle zones on/off
7. Live Preview — Real-time preview
8. Complete — Ready to go

**Implementation:**
- Auto-starts for new users (checks localStorage)
- **?** button in header to replay tour
- localStorage key: `market-pulse-tour-completed`
- Tour steps defined in `TOUR_STEPS` array in `src/pages/Control.jsx`
- Uses `data-tour` attributes on elements for targeting

### Market Discovery
- **Filtered Markets** (default): Shows markets matching `EVENT_FILTERS` env var
- **All Markets**: Toggle to browse all Polymarket markets (4-hour cache)
- Operators can discover markets beyond deployment filters

### Layout Flip
- Toggle to move sidebar from right to left side
- Mirrors the entire layout for different broadcast setups
- Syncs across control panel and broadcast page

### Market Selection
- **Select All** button to select all visible markets at once
- Click individual markets to toggle selection
- **Clear** button to deselect all
- Multi-select markets by clicking, then drag to zones

### Zone Assignment
- Drag selected markets to **Featured** (trending) or **Secondary** (rotating grid)
- Main zone contains Featured + Secondary sub-zones
- Zone mini-map shows:
  - **Header** and **QR Code**: "(Fixed)" - cannot be reassigned
  - **Sidebar**: "Biggest Movers (Auto)" - auto-populated from playlist
  - **Lower Third**: "Editorial (Auto)" - cycles through editorial themes

### Theming
- 8 built-in themes + custom theme editor
- Create, edit, delete custom themes
- Colors saved to localStorage

## Control Panel Sync

Broadcast, Control Panel, and Vote page sync via **Supabase Realtime** (with BroadcastChannel fallback for same-browser):

**Supabase Table:** `broadcast_state`
- Stores zone assignments, theme, layout flip state
- Real-time updates via Postgres Changes subscription
- Vote page reads this to know which markets to display

**BroadcastChannel** (same-browser fallback):
- Channel name: `market-pulse-control`
- Message types: `ZONE_VISIBILITY`, `ASSIGN_CONTENT`, `SET_THEME`, `SET_FLIPPED`

## Voting System

### Vote Page (`/vote`)
- **Shows only selected markets** - Markets assigned to zones in Control panel
- **Grouped by events** - e.g., "Super Bowl Champion" with team outcomes underneath
- **Two tabs**: "Selected" (curated markets) and "My Votes" (user's voting history)
- **Clear data source labels**:
  - **MARKET** badge - Polymarket price data (primary)
  - **AUDIENCE** badge - Our voting results (secondary, only shown if votes exist)

### Voting Mechanics
- Anonymous voting via localStorage tokens
- Votes stored in Supabase `votes` table with price at vote time
- Results aggregated via `vote_aggregates` view

### Payout Calculation
- Calculates hypothetical Polymarket returns based on vote direction
- **YES vote**: payout = $100 / yesPrice
- **NO vote**: payout = $100 / (1 - yesPrice)
- Example: Denver at 6% → YES pays $1,666, NO pays $106

### My Votes Tab
- Shows user's voting history with current prices
- Displays both Market price and Audience vote results
- "Trade on Polymarket" affiliate link for conversion

## Formatting Utilities

Located in `lib/formatters.js`:
- `formatPrice(0.32)` → "32%"
- `formatChange(0.05)` → "+5.0%"
- `formatVolume(2400000)` → "$2.4M"
- `formatMultiplier(0.08)` → "12.5x"

## Caching Strategy

| Data Type | Cache Duration | Notes |
|-----------|---------------|-------|
| Filtered markets | 10 minutes | Default view, respects env var filters |
| All markets | 4 hours | For control page discovery |
| Editorial themes | 30 seconds | |
| Vote results | 5 seconds | Near real-time |
| Price history (sparklines) | 4 hours | Sparklines don't need frequent updates |

**Note:** The "All Markets" toggle in the control panel uses a 4-hour cache since it's for market discovery/selection, not live display. This minimizes API calls while giving operators access to the full market catalog.

## Supabase Setup

Required tables for voting and broadcast sync:

### votes table
```sql
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id TEXT NOT NULL,
  voter_token TEXT NOT NULL,
  market_slug TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
  price_at_vote DECIMAL(5,4) NOT NULL,
  provider TEXT NOT NULL DEFAULT 'polymarket',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deployment_id, voter_token, market_slug, provider)
);

CREATE INDEX IF NOT EXISTS idx_votes_deployment_market_provider ON votes(deployment_id, market_slug, provider);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(deployment_id, voter_token);
```

### vote_aggregates view
```sql
CREATE OR REPLACE VIEW vote_aggregates AS
SELECT
  deployment_id,
  market_slug,
  provider,
  COUNT(*) FILTER (WHERE vote = 'yes') as yes_count,
  COUNT(*) FILTER (WHERE vote = 'no') as no_count,
  COUNT(*) as total_count,
  COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE vote = 'yes') / NULLIF(COUNT(*), 0)), 0) as yes_percent,
  COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE vote = 'no') / NULLIF(COUNT(*), 0)), 0) as no_percent
FROM votes
GROUP BY deployment_id, market_slug, provider;
```

### broadcast_state table
```sql
CREATE TABLE IF NOT EXISTS broadcast_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO broadcast_state (id, state) VALUES ('default', '{}') ON CONFLICT (id) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE broadcast_state;
```

## Graceful Degradation

When Supabase unavailable, skip crowd-dependent themes:
- Sentiment Gap
- Crowd Favorites
- Most Engaged

## Routes

- `/broadcast` - OBS capture target, landscape 16:9 (1920x1080, transparent bg)
- `/broadcast/portrait` - OBS capture target, portrait 9:16 (1080x1920, transparent bg)
- `/control` - Operator control panel (assign markets to zones, theme selection, dual preview)
- `/vote` - Mobile voting companion (shows only markets selected in control panel)

### Portrait Layout (9:16)

The portrait broadcast layout is optimized for vertical displays:
```
┌─────────────────────┐
│       HEADER        │  70px
├─────────────────────┤
│                     │
│        MAIN         │  flex
│                     │
├───────────────┬─────┤
│  LOWER THIRD  │ QR  │  220px
├───────────────┴─────┤
│       TICKER        │  60px
└─────────────────────┘
```
- **Header** (70px): Compact, centered logo and live indicator
- **Main** (flex): Featured market only (no secondary grid)
- **Lower Third + QR** (220px): Editorial card alongside QR code
- **Ticker** (60px): Horizontal scrolling markets

**Zones removed in portrait:** Sidebar, Secondary markets grid

Both layouts share the same state via Supabase and can run simultaneously. Zone visibility toggles in the control panel affect both orientations (except sidebar only affects landscape).
