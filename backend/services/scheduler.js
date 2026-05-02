/**
 * @module services/scheduler
 * @description node-cron scheduler — refreshes articles every 30 minutes.
 * Also exposes a manual `runRefresh()` for the initial startup fetch.
 */

const cron = require('node-cron');
const { fetchAllArticles } = require('./newsFetcher');
const { summarizeArticles } = require('./summarizer');
const { clusterArticles } = require('./clusterer');
const store = require('../store/newsStore');

const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

/**
 * Full pipeline: fetch → summarize → cluster → persist.
 */
const runRefresh = async () => {
  try {
    console.log(`\n[${ts()}] ═══════════════════════════════════════`);
    console.log(`[${ts()}] ▶ Starting news refresh pipeline…`);

    // 1. Fetch articles from all sources
    const articles = await fetchAllArticles();
    if (!articles.length) {
      console.log(`[${ts()}] ⚠ No articles fetched — skipping update`);
      return;
    }

    // 2. Enrich with AI summaries + sentiment + topics
    const enriched = await summarizeArticles(articles);

    // 3. Cluster by topic similarity
    const clusters = clusterArticles(enriched);

    // 4. Persist to in-memory store
    store.updateStore(enriched, clusters);

    console.log(`[${ts()}] ✓ Refresh complete — ${enriched.length} articles in ${clusters.length} clusters`);
    console.log(`[${ts()}] ═══════════════════════════════════════\n`);
  } catch (err) {
    console.error(`[${ts()}] ✗ Refresh pipeline failed: ${err.message}`);
  }
};

/**
 * Schedule the refresh pipeline with node-cron.
 * Runs every 30 minutes (minute 0 and 30 of every hour).
 */
const startScheduler = () => {
  cron.schedule('*/30 * * * *', () => {
    console.log(`[${ts()}] ⏰ Scheduled refresh triggered`);
    runRefresh();
  });
  console.log(`[${ts()}] ⏱ Scheduler started — refreshing every 30 minutes`);
};

module.exports = { runRefresh, startScheduler };
