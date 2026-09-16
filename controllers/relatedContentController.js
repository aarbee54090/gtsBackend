const { suggestRelatedContent } = require("../services/relatedContentService");

// POST /api/related-content/suggest
// Admin-protected (exposes draft content across all 4 types). Body:
// { sport, productType, tags, excludeType, excludeId, limit }
async function suggest(req, res) {
  try {
    const { sport, productType, tags, excludeType, excludeId, limit } = req.body;
    const results = await suggestRelatedContent({
      sport,
      productType,
      tags,
      excludeType,
      excludeId,
      limit: limit || 10,
    });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { suggest };
