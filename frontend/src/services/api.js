/**
 * @module services/api
 * @description All API calls to the News Digest backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_KEY = import.meta.env.VITE_API_KEY || 'pushkar_news_digest_2026_secure_key';

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json',
};

/**
 * Fetch the full news digest.
 * @param {{ sentiment?: string, limit?: number }} params
 */
export const fetchDigest = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.sentiment && params.sentiment !== 'all') {
    query.set('sentiment', params.sentiment);
  }
  if (params.limit) {
    query.set('limit', String(params.limit));
  }
  if (params.page) {
    query.set('page', String(params.page));
  }

  const qs = query.toString();
  const url = `${API_BASE}/digest${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Digest fetch failed: ${res.status}`);
  return res.json();
};

/**
 * Fetch clusters filtered by topic.
 * @param {string} name
 */
export const fetchTopic = async (name) => {
  const res = await fetch(`${API_BASE}/topic/${encodeURIComponent(name)}`, { headers });
  if (!res.ok) throw new Error(`Topic fetch failed: ${res.status}`);
  return res.json();
};

/**
 * List all available topics.
 */
export const fetchTopics = async () => {
  const res = await fetch(`${API_BASE}/topics`, { headers });
  if (!res.ok) throw new Error(`Topics fetch failed: ${res.status}`);
  return res.json();
};

/**
 * Subscribe an email to topics.
 * @param {string} email
 * @param {string[]} topics
 */
export const subscribe = async (email, topics) => {
  const res = await fetch(`${API_BASE}/subscribe`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, topics }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Subscribe failed: ${res.status}`);
  }
  return res.json();
};

/**
 * Trigger a manual refresh of the digest.
 */
export const triggerRefresh = async () => {
  const res = await fetch(`${API_BASE}/digest/refresh`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Refresh failed: ${res.status}`);
  }
  return res.json();
};
