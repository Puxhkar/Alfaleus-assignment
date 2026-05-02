/**
 * @module routes/subscribe
 * @description
 *   POST /api/subscribe           — subscribe email to topic list
 *   GET  /api/subscriptions/:email — get subscriptions for an email
 */

const express = require('express');
const router = express.Router();
const store = require('../store/newsStore');

// Simple email regex (good enough for validation)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/subscribe
 * Body: { email: string, topics: string[] }
 */
router.post('/', (req, res) => {
  try {
    const { email, topics } = req.body;

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'Topics must be a non-empty array' });
    }

    store.subscribe(email, topics.map((t) => t.toLowerCase()));

    res.json({
      success: true,
      message: `Subscribed to ${topics.join(', ')}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Subscription failed' });
  }
});

/**
 * GET /api/subscriptions/:email
 */
router.get('/:email', (req, res) => {
  try {
    const result = store.getSubscriptions(req.params.email);
    if (!result) {
      return res.status(404).json({ error: 'No subscription found for this email' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

module.exports = router;
