/**
 * @module services/clusterer
 * @description Groups articles by semantic similarity using a custom
 * Bag-of-Words and Cosine Similarity algorithm.
 */

const { v4: uuidv4 } = require('uuid');

// ─── Constants ─────────────────────────────────────────────
const MAX_ARTICLES_PER_CLUSTER = 10;
const SIMILARITY_THRESHOLD = 0.35; // Adjust based on testing

// ─── NLP Helpers ───────────────────────────────────────────

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2); // basic stopword filter
};

const getTermFrequencies = (tokens) => {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  return tf;
};

const cosineSimilarity = (tf1, tf2) => {
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const [term, freq] of Object.entries(tf1)) {
    dotProduct += freq * (tf2[term] || 0);
    mag1 += freq * freq;
  }

  for (const freq of Object.values(tf2)) {
    mag2 += freq * freq;
  }

  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
};

const calculateSimilarity = (articleA, articleB) => {
  const textA = `${articleA.title || ''} ${articleA.description || ''}`;
  const textB = `${articleB.title || ''} ${articleB.description || ''}`;

  const tfA = getTermFrequencies(tokenize(textA));
  const tfB = getTermFrequencies(tokenize(textB));

  return cosineSimilarity(tfA, tfB);
};

// ─── Helpers ───────────────────────────────────────────────

const dominantTopic = (articles) => {
  const freq = {};
  articles.forEach((a) => {
    (a.topics || []).forEach((t) => {
      freq[t] = (freq[t] || 0) + 1;
    });
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.length ? sorted[0][0] : 'general';
};

const sentimentBreakdown = (articles) => {
  const counts = { positive: 0, neutral: 0, negative: 0 };
  articles.forEach((a) => {
    const s = a.sentiment || 'neutral';
    if (counts[s] !== undefined) counts[s] += 1;
  });
  return counts;
};

// ─── Core Clustering Logic ─────────────────────────────────

/**
 * Group articles into clusters by semantic similarity.
 * 
 * Algorithm:
 * 1. For each article, compare it to existing clusters.
 * 2. If it exceeds SIMILARITY_THRESHOLD with any article in a cluster, add it.
 * 3. Otherwise, create a new cluster.
 * 
 * @param {object[]} articles
 * @returns {object[]} Array of cluster objects, sorted by latestAt desc.
 */
const clusterArticles = (articles) => {
  if (!articles.length) return [];

  const clustersArr = []; // Array of arrays of articles

  for (const article of articles) {
    let added = false;

    // Check against existing clusters
    for (const cluster of clustersArr) {
      for (const existingArticle of cluster) {
        const similarity = calculateSimilarity(article, existingArticle);
        if (similarity >= SIMILARITY_THRESHOLD) {
          cluster.push(article);
          added = true;
          break; // Move to next article once added to a cluster
        }
      }
      if (added) break;
    }

    // If not similar to any existing cluster, create a new one
    if (!added) {
      clustersArr.push([article]);
    }
  }

  // Build cluster objects
  const clusters = clustersArr.map((clusterArticles) => {
    const sortedArticles = clusterArticles
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, MAX_ARTICLES_PER_CLUSTER);

    const sources = [...new Set(sortedArticles.map((a) => a.sourceName))];

    const ai_insight = {
      why_it_matters: sortedArticles.find(a => a.why_it_matters)?.why_it_matters || 'Information unavailable.',
      key_points: [...new Set(sortedArticles.flatMap(a => a.key_points || []))].slice(0, 4),
      confidence_score: (sortedArticles.reduce((sum, a) => sum + (a.confidence_score || 0.8), 0) / sortedArticles.length).toFixed(2)
    };

    return {
      id: uuidv4(),
      clusterTopic: dominantTopic(sortedArticles),
      ai_insight,
      articles: sortedArticles,
      articleCount: sortedArticles.length,
      sources,
      latestAt: sortedArticles[0]?.publishedAt || new Date().toISOString(),
      sentimentBreakdown: sentimentBreakdown(sortedArticles),
    };
  });

  // Sort by most recent first
  clusters.sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt));

  return clusters;
};

module.exports = { clusterArticles };
