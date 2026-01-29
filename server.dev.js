/**
 * Development server for API endpoints
 * Runs on port 3001, Vite proxies /api requests to this server
 */

// Load env vars FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Now dynamically import the rest
const { default: express } = await import('express');
const { default: cors } = await import('cors');

// Import API handlers dynamically after env is loaded
const { default: marketsHandler } = await import('./api/markets.js');
const { default: eventsHandler } = await import('./api/events.js');
const { default: editorialHandler } = await import('./api/editorial.js');
const { default: voteHandler } = await import('./api/vote.js');
const { default: resultsHandler } = await import('./api/results.js');
const { default: configHandler } = await import('./api/config.js');
const { default: debugMarketsHandler } = await import('./api/debug-markets.js');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to wrap Vercel-style handlers
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      // Merge params into query (for dynamic routes)
      Object.assign(req.query, req.params);
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

// API Routes
app.get('/api/markets', wrapHandler(marketsHandler));
app.get('/api/events', wrapHandler(eventsHandler));
app.get('/api/editorial', wrapHandler(editorialHandler));
app.get('/api/prices', async (req, res) => {
  try {
    const { default: handler } = await import('./api/prices.js');
    await handler(req, res);
  } catch (error) {
    console.error('Prices API Error:', error);
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/vote', wrapHandler(voteHandler));
app.get('/api/results', wrapHandler(resultsHandler));
app.get('/api/config', wrapHandler(configHandler));
app.get('/api/debug-markets', wrapHandler(debugMarketsHandler));

// Start server
app.listen(PORT, () => {
  console.log(`API dev server running at http://localhost:${PORT}`);
});
