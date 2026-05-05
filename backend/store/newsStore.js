/**
 * @module newsStore
 * @description In-memory data store for articles, clusters, and subscriptions.
 * No external database required — all data lives in Maps/Arrays.
 */

// ─── In-Memory Collections ────────────────────────────────
/** @type {Map<string, object>} URL → Article */
const articles = new Map();

/** @type {Array<object>} Computed topic clusters */
let clusters = [];

/** @type {Date|null} Timestamp of last successful refresh */
let lastUpdated = null;

/** @type {Map<string, string[]>} email → topic list */
const subscriptions = new Map();

// ─── Public API ────────────────────────────────────────────

/**
 * Return every article in the store.
 * @returns {object[]}
 */
const getAll = () => Array.from(articles.values());

/**
 * Return the current cluster list.
 * @returns {object[]}
 */
const getClusters = () => clusters;

/**
 * Filter clusters whose clusterTopic matches `name` (case-insensitive)
 * OR any article inside them has `name` in its topics array.
 * @param {string} name
 * @returns {object[]}
 */
const getByTopic = (name) => {
  const lower = name.toLowerCase();
  return clusters.filter((c) => {
    if (c.clusterTopic.toLowerCase() === lower) return true;
    return c.articles.some((a) =>
      (a.topics || []).some((t) => t.toLowerCase() === lower)
    );
  });
};

/**
 * Persist a fresh set of articles + clusters.
 * @param {object[]} newArticles
 * @param {object[]} newClusters
 */
const updateStore = (newArticles, newClusters) => {
  // Merge new articles (upsert by URL)
  newArticles.forEach((a) => articles.set(a.url, a));
  clusters = newClusters;
  lastUpdated = new Date();
};

/**
 * Add or overwrite a subscription.
 * @param {string} email
 * @param {string[]} topics
 */
const subscribe = (email, topics) => {
  subscriptions.set(email, topics);
};

/**
 * Retrieve subscription for an email.
 * @param {string} email
 * @returns {{ email: string, topics: string[] } | null}
 */
const getSubscriptions = (email) => {
  if (!subscriptions.has(email)) return null;
  return { email, topics: subscriptions.get(email) };
};

/**
 * @returns {Date|null}
 */
const getLastUpdated = () => lastUpdated;

/**
 * Collect every unique topic tag across all articles.
 * @returns {string[]}
 */
const getAllTopics = () => {
  const set = new Set();
  articles.forEach((a) => {
    (a.topics || []).forEach((t) => set.add(t.toLowerCase()));
  });
  return Array.from(set).sort();
};

module.exports = {
  getAll,
  getClusters,
  getByTopic,
  updateStore,
  subscribe,
  getSubscriptions,
  getLastUpdated,
  getAllTopics,
};
