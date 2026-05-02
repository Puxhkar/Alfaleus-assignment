/**
 * @module services/summarizer
 * @description Uses Groq API to generate
 * 2-sentence summaries, sentiment labels, and topic tags for each article.
 * Processes articles in batches of 5 with a 500 ms delay between batches
 * to avoid rate limits. Falls back gracefully on any error.
 */

const Groq = require('groq-sdk');

// ─── Constants ─────────────────────────────────────────────
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 500;
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an elite news intelligence AI. Given an article title and description, return ONLY a valid JSON object with these exact fields:
{
  "headline": "<an engaging, concise rewrite of the title>",
  "summary": "<exactly 2 sentences, max 60 words total>",
  "key_points": ["<point 1>", "<point 2>", "<point 3>"],
  "why_it_matters": "<1 sentence explaining market/public impact>",
  "sentiment": "<one of: positive, neutral, negative>",
  "topics": ["<2-4 topic tags like technology, AI, startups>"],
  "confidence_score": <float between 0.0 and 1.0>
}
Return ONLY the JSON object. Do not include markdown formatting or extra text.`;

// ─── Helpers ───────────────────────────────────────────────

const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Build a fallback enrichment when Groq is unavailable.
 * @param {object} article
 * @returns {object}
 */
const fallback = (article) => ({
  headline: article.title || 'Untitled Article',
  summary: (article.description || article.title || '').slice(0, 120) + '…',
  key_points: ['Information unavailable.'],
  why_it_matters: 'Details needed for impact analysis.',
  sentiment: 'neutral',
  topics: [article.category || 'general'],
  confidence_score: 0.5,
});

// ─── Core ──────────────────────────────────────────────────

/**
 * Call Groq for a single article.
 * @param {object} groq  Groq SDK instance
 * @param {object} article
 * @returns {Promise<object>} { headline, summary, key_points, why_it_matters, sentiment, topics, confidence_score }
 */
const summarizeOne = async (groq, article) => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Title: ${article.title}\nDescription: ${article.description || 'No description available.'}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);

    return {
      headline: parsed.headline || article.title,
      summary: parsed.summary || fallback(article).summary,
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points : fallback(article).key_points,
      why_it_matters: parsed.why_it_matters || fallback(article).why_it_matters,
      sentiment: ['positive', 'neutral', 'negative'].includes(parsed.sentiment)
        ? parsed.sentiment
        : 'neutral',
      topics: Array.isArray(parsed.topics) && parsed.topics.length
        ? parsed.topics.map((t) => t.toLowerCase())
        : [article.category || 'general'],
      confidence_score: typeof parsed.confidence_score === 'number' ? parsed.confidence_score : 0.8,
    };
  } catch (err) {
    console.error(`[${ts()}] ✗ Groq error for "${article.title?.slice(0, 40)}…": ${err.message}`);
    return fallback(article);
  }
};

/**
 * Enrich every article with summary, sentiment, and topics.
 * Processes in batches of BATCH_SIZE with BATCH_DELAY_MS between batches.
 * @param {object[]} articles
 * @returns {Promise<object[]>} articles with added summary/sentiment/topics
 */
const summarizeArticles = async (articles) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_key_here') {
    console.log(`[${ts()}] ⚠ GROQ_API_KEY not set — using fallback summaries`);
    return articles.map((a) => ({ ...a, ...fallback(a) }));
  }

  const groq = new Groq({ apiKey });
  const enriched = [];

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (article) => {
        const enrichment = await summarizeOne(groq, article);
        return { ...article, ...enrichment };
      })
    );
    enriched.push(...results);

    if (i + BATCH_SIZE < articles.length) {
      await sleep(BATCH_DELAY_MS);
    }

    console.log(`[${ts()}] ✓ Summarized batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(articles.length / BATCH_SIZE)}`);
  }

  return enriched;
};

module.exports = { summarizeArticles };
