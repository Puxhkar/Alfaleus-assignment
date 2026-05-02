/**
 * @module routes/digest
 * @description GET /api/digest — returns clustered news digest with optional
 * sentiment and limit filters.
 * POST /api/refresh — triggers manual news fetch.
 */

const express = require('express');
const router = express.Router();
const store = require('../store/newsStore');
const scheduler = require('../services/scheduler');

/**
 * GET /api/digest
 * Query params:
 *   - sentiment  (optional): positive | neutral | negative
 *   - page       (optional): current page (default 1)
 *   - limit      (optional): items per page (default 10)
 */
router.get('/', (req, res) => {
  try {
    let clusters = store.getClusters();
    const lastUpdated = store.getLastUpdated();

    // Optional sentiment filter
    if (req.query.sentiment && req.query.sentiment !== 'all') {
      const target = req.query.sentiment.toLowerCase();
      clusters = clusters.filter((c) => {
        const bd = c.sentimentBreakdown || {};
        const entries = Object.entries(bd).sort((a, b) => b[1] - a[1]);
        return entries.length > 0 && entries[0][0] === target;
      });
    }

    const totalClusters = clusters.length;

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    clusters = clusters.slice(start, end);

    res.json({
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
      totalArticles: store.getAll().length,
      totalClusters,
      currentPage: page,
      totalPages: Math.ceil(totalClusters / limit),
      hasMore: end < totalClusters,
      clusters,
    });
  } catch (err) {
    console.error('Digest route error:', err.message);
    res.status(500).json({ error: 'Failed to fetch digest' });
  }
});

/**
 * POST /api/refresh
 * Triggers a manual refresh of news sources.
 */
router.post('/refresh', async (req, res) => {
  try {
    // Run asynchronously to avoid blocking the response if it takes a while
    scheduler.runRefresh();
    res.json({ message: 'Refresh pipeline triggered successfully' });
  } catch (err) {
    console.error('Refresh route error:', err.message);
    res.status(500).json({ error: 'Failed to trigger refresh' });
  }
});

module.exports = router;
