# Market Pulse

A broadcast graphics overlay system for displaying prediction market data. Designed for 1920x1080 OBS browser sources, featuring real-time data updates, themeable components, and dynamic zone control.

## Features

- **1920x1080 Broadcast Layout** - 6-zone CSS Grid optimized for OBS overlays
- **Real-time Data** - Live market prices, 24h changes, volume tracking
- **Themeable Design** - 8 built-in themes + custom theme editor
- **Dynamic Zone Control** - Show/hide zones via control panel with real-time sync
- **Layout Flip** - Mirror layout (sidebar left/right) for different broadcast setups
- **Editorial Rotation** - Automatic cycling through themed market content
- **All Markets Discovery** - Toggle between filtered defaults and all available markets
- **Price Trend Charts** - 7-day sparkline visualizations

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to Vercel
vercel --prod
```

### URLs

| Route | Description |
|-------|-------------|
| `/broadcast` | OBS capture target (1920x1080, transparent background) |
| `/broadcast?debug=true` | With dark background for testing |
| `/control` | Operator control panel |
| `/vote` | Mobile voting companion |

## Control Panel

The `/control` page provides full broadcast management:

### Available Markets
- **Filtered Markets** (default): Shows markets matching your deployment's `EVENT_FILTERS`
- **All Markets**: Toggle to browse all available Polymarket markets
- Search and filter markets by name
- Multi-select markets by clicking, then drag to zones

### Zone Layout
- Visual mini-map showing all 6 zones
- Drag markets to **Featured** (trending) or **Secondary** (rotating grid)
- **Flip Layout** toggle moves sidebar between left/right
- Zone visibility toggles

### Themes
- 8 built-in themes (Market Pulse, Midnight Terminal, Golden Hour, etc.)
- Custom theme editor with color pickers
- Create, edit, and delete custom themes
- Live preview of changes

## Layout Zones

The broadcast layout is a CSS Grid with 6 zones:

```
┌─────────────────────────────────────────┐
│                 HEADER                   │
├────────────────────────────┬────────────┤
│                            │            │
│           MAIN             │  SIDEBAR   │
│   ┌──────────────────┐     │ (Big       │
│   │    FEATURED      │     │  Movers)   │
│   │  (Trending/Auto) │     │            │
│   ├──────────────────┤     │            │
│   │   SECONDARY      │     │            │
│   │ (Rotating Cards) │     │            │
│   └──────────────────┘     │            │
├────────────────────────────┼────────────┤
│        LOWER THIRD         │   BOTTOM   │
│    (Editorial Content)     │   CORNER   │
├────────────────────────────┴────────────┤
│                 TICKER                   │
└─────────────────────────────────────────┘
```

With **Flip Layout** enabled, sidebar moves to the left side.

### Zone Details

| Zone | Size | Content |
|------|------|---------|
| Header | 90px | Logo, live indicator, countdown timer |
| Main | flex | Featured market + secondary grid |
| Sidebar | 360px | Big Movers list (24h price changes) |
| Lower Third | auto | Rotating editorial cards |
| Bottom Corner | 360px | Vote CTA with QR code |
| Ticker | 64px | Scrolling market outcomes |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/events` | Markets filtered by deployment config |
| `GET /api/events?all=true` | ALL markets (4-hour cache, for discovery) |
| `GET /api/config` | Site configuration |
| `GET /api/markets` | Individual markets list |
| `GET /api/prices?tokenId=X&interval=1w` | Price history for sparklines |
| `GET /api/editorial` | Themed market collections |
| `POST /api/vote` | Submit a vote |
| `GET /api/results` | Vote results |

### Caching Strategy

| Data Type | Cache Duration | Notes |
|-----------|---------------|-------|
| Filtered markets | No cache | Changes with env vars |
| All markets | 4 hours | For control page discovery |
| Price history | 4 hours | Sparklines don't need frequent updates |
| Vote results | 5 seconds | Near real-time |

## Environment Variables

### Provider Configuration

```env
# Data provider
PROVIDER=polymarket

# Market filtering (comma-separated, case-insensitive)
EVENT_FILTERS=nfl,super bowl,football
BLACKLIST=epl,premier league

# Optional: Custom API URLs
POLYMARKET_GAMMA_URL=https://gamma-api.polymarket.com
POLYMARKET_CLOB_URL=https://clob.polymarket.com
```

### Display Configuration

```env
# Branding
SITE_NAME=Market Pulse
DEPLOYMENT_ID=nfl-markets
DEFAULT_THEME=default

# Countdown timer (optional)
COUNTDOWN_DATE=2025-02-09T23:30:00Z
COUNTDOWN_LABEL=Super Bowl LIX
```

### Database (Supabase)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Multiple Deployments

You can run multiple branded instances with different market filters:

| Deployment | EVENT_FILTERS | Example |
|------------|--------------|---------|
| NFL Markets | `nfl,super bowl,football` | nfl.marketpulse.com |
| Politics | `trump,biden,election,congress` | politics.marketpulse.com |
| Crypto | `bitcoin,ethereum,crypto` | crypto.marketpulse.com |

Each deployment shows filtered markets by default, but operators can toggle **"All Markets"** in the control panel to discover markets beyond the filters.

## Theming System

### Built-in Themes

| Theme | Description |
|-------|-------------|
| Market Pulse | Default blue/orange |
| Midnight Terminal | Matrix green |
| Golden Hour | Warm orange/coral |
| Arctic Blue | Ice blue/frost |
| Neon Nights | Hot magenta/cyan |
| Carbon Fiber | Silver/racing red |
| Manchester United | Team colors |
| Seattle Seahawks | Team colors |

### Custom Themes

Create custom themes via the control panel Theme Editor:
- Pick colors for all 11 color tokens
- Live preview as you edit
- Saved to localStorage (persists across sessions)
- Reset built-in themes to defaults

### Color Tokens

```javascript
{
  primary: '#00b4ff',      // Primary brand color
  secondary: '#ff6b2b',    // Secondary accent
  tertiary: '#00d68f',     // Tertiary accent
  surface: 'rgba(...)',    // Card backgrounds
  surfaceAlt: 'rgba(...)', // Alternate surface
  border: 'rgba(...)',     // Border color
  text: '#FFFFFF',         // Primary text
  textMuted: 'rgba(...)',  // Secondary text
  accent: '#ff6b2b',       // Highlights
  positive: '#00d68f',     // Positive changes
  negative: '#ff4757',     // Negative changes
}
```

## OBS Setup

1. Add a **Browser Source** in OBS
2. Set URL to: `https://your-domain.vercel.app/broadcast`
3. Set dimensions to **1920x1080**
4. Enable **"Shutdown source when not visible"** (optional)
5. To refresh: Right-click > **Refresh cache of current page**

### Tips

- Use `?debug=true` to show dark background when testing outside OBS
- The broadcast page has a transparent background by default
- Control panel syncs in real-time across tabs/browsers via Supabase

## Real-time Sync

The control panel and broadcast page stay in sync via:

1. **BroadcastChannel API** - Instant sync within the same browser
2. **Supabase Realtime** - Cross-browser/device sync

### Supabase Setup

```sql
CREATE TABLE broadcast_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE broadcast_state REPLICA IDENTITY FULL;
```

## Content Rotation

### Featured Market
- Shows top trending market or manually assigned market
- Displays price chart and outcome probabilities

### Secondary Markets
- 3-column grid below featured market
- Drag multiple markets to set up rotation
- 20-second rotation interval

### Editorial Lower Third
Cycles through themed market collections:
- **Big Movers** - Largest 24h changes
- **Debate Fuel** - 50/50 markets
- **Longshot Watch** - Underdogs gaining
- **Sentiment Gap** - Crowd vs market disagreement
- **Volume Surge** - High activity markets
- **Fading Fast** - Declining markets

### Big Movers Sidebar
- Top 6 markets by absolute 24h price change
- FLIP animations when rankings change
- Auto-updates from playlist events

## Project Structure

```
market-pulse/
├── api/                    # Vercel serverless functions
│   ├── events.js           # Market events (?all=true for unfiltered)
│   ├── markets.js          # Individual markets
│   ├── editorial.js        # Themed collections
│   ├── prices.js           # Price history
│   ├── vote.js             # Voting
│   └── results.js          # Vote results
├── lib/
│   ├── providers/          # Data provider adapters
│   │   └── polymarket.js   # Polymarket implementation
│   ├── config.js           # Environment config
│   ├── transformers.js     # Data normalization
│   └── formatters.js       # Display formatting
├── src/
│   ├── components/
│   │   ├── zones/          # Layout zones
│   │   ├── content/        # Content displays
│   │   └── ui/             # Reusable components
│   ├── hooks/              # React hooks
│   ├── layouts/            # BroadcastLayout
│   ├── pages/              # Broadcast, Control, Vote
│   └── themes/             # Theme system
└── vercel.json             # Vercel config
```

## Tech Stack

- **Frontend**: React 19, Vite, React Router
- **Backend**: Vercel Serverless Functions
- **Real-time**: Supabase Realtime (PostgreSQL)
- **Data Source**: Polymarket API
- **Deployment**: Vercel

## License

MIT
