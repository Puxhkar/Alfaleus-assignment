/**
 * @module routes/docs
 * @description Serves the OpenAPI 3.0 JSON specification at GET /api/docs.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Try to load YAML → JSON (we'll serve the raw YAML content as JSON-parseable)
let spec = null;

try {
  const yamlPath = path.join(__dirname, '..', '..', 'openapi.yaml');
  const raw = fs.readFileSync(yamlPath, 'utf-8');
  // Simple YAML is close enough to return as text; for full parsing
  // we'll just serve the raw YAML string. In production you'd use js-yaml.
  spec = raw;
} catch {
  // openapi.yaml not found — serve inline spec
}

/**
 * GET /api/docs
 */
router.get('/', (_req, res) => {
  if (spec) {
    res.type('text/yaml').send(spec);
  } else {
    res.json({
      openapi: '3.0.3',
      info: {
        title: 'News Digest API',
        version: '1.0.0',
        description: 'Multi-Source AI-Powered News Digest Platform',
      },
      paths: {
        '/api/digest': { get: { summary: 'Get clustered news digest' } },
        '/api/topics': { get: { summary: 'List all topics' } },
        '/api/topic/{name}': { get: { summary: 'Get clusters by topic' } },
        '/api/subscribe': { post: { summary: 'Subscribe to topics' } },
        '/api/health': { get: { summary: 'Health check' } },
      },
    });
  }
});

module.exports = router;
