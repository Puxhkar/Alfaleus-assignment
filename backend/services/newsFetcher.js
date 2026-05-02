/**
 * @module services/newsFetcher
 * @description Fetches articles from NewsAPI.org (top-headlines per category)
 * and RSS feeds (BBC News, TechCrunch via rss2json.com) in parallel.
 * Deduplicates by URL and normalises every item to a common Article shape.
 */

const axios = require('axios');

// ─── Constants ─────────────────────────────────────────────
const NEWS_API_BASE = 'https://newsapi.org/v2/top-headlines';
const NEWS_API_CATEGORIES = ['technology', 'business', 'health', 'science', 'sports'];

const RSS_FEEDS = [
  {
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/rss.xml',
    source: 'BBC News',
    category: 'general',
  },
  {
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/feed/',
    source: 'TechCrunch',
    category: 'technology',
  },
];

// ─── Helpers ───────────────────────────────────────────────

/**
 * Formatted timestamp for console output.
 * @returns {string}
 */
const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

/**
 * Map a NewsAPI article to the common shape.
 * @param {object} raw
 * @param {string} category
 * @returns {object}
 */
const mapNewsApiArticle = (raw, category) => ({
  title: raw.title || '',
  description: raw.description || '',
  url: raw.url,
  urlToImage: raw.urlToImage || null,
  publishedAt: raw.publishedAt || new Date().toISOString(),
  sourceName: raw.source?.name || 'Unknown',
  category,
});

/**
 * Map an RSS item (from rss2json) to the common shape.
 * @param {object} item
 * @param {string} source
 * @param {string} category
 * @returns {object}
 */
const mapRssItem = (item, source, category) => ({
  title: item.title || '',
  description: item.description ? item.description.replace(/<[^>]*>/g, '').slice(0, 500) : '',
  url: item.link || item.guid,
  urlToImage: item.enclosure?.link || item.thumbnail || null,
  publishedAt: item.pubDate || new Date().toISOString(),
  sourceName: source,
  category,
});

// ─── Fetchers ──────────────────────────────────────────────

/**
 * Fetch top-headlines from NewsAPI for all configured categories.
 * @returns {Promise<object[]>}
 */
const fetchNewsApi = async () => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    console.log(`[${ts()}] ⚠ NEWS_API_KEY not set — skipping NewsAPI`);
    return [];
  }

  const promises = NEWS_API_CATEGORIES.map(async (cat) => {
    try {
      const { data } = await axios.get(NEWS_API_BASE, {
        params: { category: cat, language: 'en', pageSize: 10, apiKey },
        timeout: 10000,
      });
      return (data.articles || [])
        .filter((a) => a.title && a.url && a.title !== '[Removed]')
        .map((a) => mapNewsApiArticle(a, cat));
    } catch (err) {
      console.error(`[${ts()}] ✗ NewsAPI (${cat}): ${err.message}`);
      return [];
    }
  });

  const results = await Promise.all(promises);
  return results.flat();
};

/**
 * Fetch articles from RSS feeds via rss2json.
 * @returns {Promise<object[]>}
 */
const fetchRssFeeds = async () => {
  const promises = RSS_FEEDS.map(async ({ url, source, category }) => {
    try {
      const { data } = await axios.get(url, { timeout: 10000 });
      if (data.status !== 'ok') return [];
      return (data.items || [])
        .filter((i) => i.title && (i.link || i.guid))
        .map((i) => mapRssItem(i, source, category));
    } catch (err) {
      console.error(`[${ts()}] ✗ RSS (${source}): ${err.message}`);
      return [];
    }
  });

  const results = await Promise.all(promises);
  return results.flat();
};

// ─── Main Export ───────────────────────────────────────────

/**
 * Fetch from all sources in parallel, deduplicate by URL.
 * @returns {Promise<object[]>}
 */
const fetchAllArticles = async () => {
  console.log(`[${ts()}] ⟳ Fetching articles from all sources…`);

  const [newsApiArticles, rssArticles] = await Promise.all([
    fetchNewsApi(),
    fetchRssFeeds(),
  ]);

  // Deduplicate by URL
  const seen = new Set();
  const combined = [];
  for (const article of [...newsApiArticles, ...rssArticles]) {
    if (!seen.has(article.url)) {
      seen.add(article.url);
      combined.push(article);
    }
  }

  console.log(`[${ts()}] ✓ Fetched ${combined.length} unique articles (NewsAPI: ${newsApiArticles.length}, RSS: ${rssArticles.length})`);
  return combined;
};

module.exports = { fetchAllArticles };
