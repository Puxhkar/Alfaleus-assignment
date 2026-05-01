/**
 * @module middleware/rateLimiter
 * @description Simple in-memory rate limiter — 60 requests per minute per IP.
 * Resets the counter every 60 seconds.
 */

const RATE_LIMIT = 60;          // max requests
const WINDOW_MS  = 60 * 1000;   // 1 minute

/** @type {Map<string, { count: number, resetAt: number }>} */
const ipMap = new Map();

/**
 * Express middleware — enforces per-IP rate limiting.
 */
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  if (!ipMap.has(ip) || ipMap.get(ip).resetAt <= now) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  const entry = ipMap.get(ip);
  entry.count += 1;

  if (entry.count > RATE_LIMIT) {
    return res
      .status(429)
      .json({ error: 'Rate limit exceeded. Try again later.' });
  }

  next();
};

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipMap) {
    if (entry.resetAt <= now) ipMap.delete(ip);
  }
}, 5 * 60 * 1000);

module.exports = rateLimiter;
