/**
 * @module routes/topic
 * @description
 *   GET /api/topic/:name  — clusters filtered by topic
 *   GET /api/topics       — list all available topic tags
 */

const express = require('express');
const router = express.Router();
const store = require('../store/newsStore');

/**
 * GET /api/topics
 * Returns all unique topic tags currently in the store.
 */
router.get('/', (req, res) => {
  try {
    const topics = store.getAllTopics();
    res.json({ topics });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

/**
 * GET /api/topic/:name
 * Filters clusters where clusterTopic matches :name (case-insensitive)
 * or any article's topics array includes :name.
 */
router.get('/:name', (req, res) => {
  try {
    const name = req.params.name;
    const clusters = store.getByTopic(name);
    res.json({
      topic: name.toLowerCase(),
      clusters,
      count: clusters.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

module.exports = router;
