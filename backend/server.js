/**
 * @module server
 * @description Express entry point for the News Digest API.
 * - CORS enabled for the frontend on port 3000
 * - JSON body parser
 * - API key auth + rate limiting middleware
 * - Routes mounted under /api
 * - On startup: run first fetch, then schedule every 30 min
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Middleware
const apiKeyAuth = require('./middleware/apiKey');
const rateLimiter = require('./middleware/rateLimiter');

// Routes
const digestRoutes = require('./routes/digest');
const topicRoutes = require('./routes/topic');
const subscribeRoutes = require('./routes/subscribe');
const docsRoutes = require('./routes/docs');

// Services
const { runRefresh, startScheduler } = require('./services/scheduler');

// ─── App Setup ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

// Core middleware
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow localhost and vercel deployments
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json());

// Rate limiting on all API routes
app.use('/api', rateLimiter);

// API key auth on all API routes (skips /api/docs and /api/health internally)
app.use('/api', apiKeyAuth);

// ─── Routes ────────────────────────────────────────────────

// Health check (no auth required — apiKey middleware skips /api/health)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// OpenAPI docs
app.use('/api/docs', docsRoutes);

// Core endpoints
app.use('/api/digest', digestRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/topic', topicRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/subscriptions', subscribeRoutes);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(`[${ts()}] Unhandled error:`, err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ─────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n[${ts()}] 🚀 News Digest API running on http://localhost:${PORT}`);
  console.log(`[${ts()}] 📖 API docs at http://localhost:${PORT}/api/docs`);
  console.log(`[${ts()}] ❤️  Health check at http://localhost:${PORT}/api/health\n`);

  // Run first fetch immediately on startup
  await runRefresh();

  // Schedule subsequent refreshes every 30 minutes
  startScheduler();
});
