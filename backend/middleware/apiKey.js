/**
 * @module middleware/apiKey
 * @description Validates the X-API-Key header on every /api/* request
 * except /api/docs and /api/health.
 */

const OPEN_PATHS = ['/api/docs', '/api/health'];

/**
 * Express middleware — checks X-API-Key against process.env.API_KEY.
 */
const apiKeyAuth = (req, res, next) => {
  // Skip open paths (handling potential trailing slashes or subpaths)
  if (req.path === '/health' || req.path === '/docs' || req.path === '/health/' || req.path === '/docs/') {
    return next();
  }

  const key = req.headers['x-api-key'];
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
};

module.exports = apiKeyAuth;
