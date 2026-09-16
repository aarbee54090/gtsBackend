const mongoose = require("mongoose");

// Lazy-required so this file can be required before all 4 models are
// registered without hitting a circular-require issue.
function getModels() {
  return {
    portfolio: mongoose.model("PortfolioProject"),
    journal: mongoose.model("JournalArticle"),
    "new-arrival": mongoose.model("NewArrival"),
    material: mongoose.model("Material"),
  };
}

const SCORE_WEIGHTS = { sport: 3, productType: 2, tagMatch: 1 };

function scoreRelevance(doc, candidate) {
  let score = 0;
  if (doc.sport && doc.sport === candidate.sport) score += SCORE_WEIGHTS.sport;
  if (doc.productType && doc.productType === candidate.productType) score += SCORE_WEIGHTS.productType;
  const sharedTags = (doc.tags ?? []).filter((t) => candidate.tags?.includes(t));
  score += sharedTags.length * SCORE_WEIGHTS.tagMatch;
  return score;
}

// Source 1: exactly what the admin manually linked, in the order they
// linked it - the highest-priority source, shown first regardless of score.
async function getManualRelated(models, doc) {
  const manual = [];
  for (const rel of doc.relatedContent ?? []) {
    const Model = models[rel.contentType];
    if (!Model) continue;
    const item = await Model.findOne({ _id: rel.refId, status: "published" }).lean();
    if (item) manual.push({ contentType: rel.contentType, item });
  }
  return manual;
}

// Source 2: other published documents (any of the 4 types) whose OWN
// relatedContent array points back at this one. Nothing is written for
// this direction - it's computed fresh on every read via the indexed
// "relatedContent.refId" field on each model.
async function getReverseRelated(models, contentType, doc) {
  const reverse = [];
  for (const [type, Model] of Object.entries(models)) {
    const matches = await Model.find({
      _id: { $ne: doc._id },
      status: "published",
      relatedContent: { $elemMatch: { contentType, refId: doc._id } },
    }).lean();
    matches.forEach((item) => reverse.push({ contentType: type, item }));
  }
  return reverse;
}

// Source 3: shared sport/productType/tags across any of the 4 types,
// ranked by relevance score (not just an unordered $or match).
async function getAutoRelated(models, doc, limit) {
  const scored = [];
  for (const [type, Model] of Object.entries(models)) {
    const orClauses = [
      doc.sport && { sport: doc.sport },
      doc.productType && { productType: doc.productType },
      doc.tags?.length && { tags: { $in: doc.tags } },
    ].filter(Boolean);
    if (orClauses.length === 0) continue;

    const candidates = await Model.find({
      _id: { $ne: doc._id },
      status: "published",
      $or: orClauses,
    }).lean();

    candidates.forEach((item) => scored.push({ contentType: type, item, score: scoreRelevance(doc, item) }));
  }
  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Returns up to `limit` related items for one piece of content, merging:
 *   1. manual   (admin-picked, highest priority)
 *   2. reverse  (other content that links TO this one, computed live)
 *   3. auto     (relevance-scored shared sport/productType/tags)
 * with duplicates removed (by contentType + _id), manual/reverse always
 * winning over a lower-priority duplicate from auto.
 */
async function getRelatedContent(contentType, doc, limit = 6) {
  const models = getModels();

  const [manual, reverse, auto] = await Promise.all([
    getManualRelated(models, doc),
    getReverseRelated(models, contentType, doc),
    getAutoRelated(models, doc, limit),
  ]);

  const seen = new Set();
  const merged = [];
  for (const group of [manual, reverse, auto]) {
    for (const entry of group) {
      const key = `${entry.contentType}:${entry.item._id}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ contentType: entry.contentType, item: entry.item });
      }
    }
  }
  return merged.slice(0, limit);
}

// Used by the admin panel while editing/creating - takes raw sport/
// productType/tags criteria (not a saved document, so this works even for
// a brand-new item that has no _id yet) and returns ranked candidates
// across all 4 types, including drafts, so the admin has full visibility
// before deciding what to actually link.
async function suggestRelatedContent({ sport, productType, tags = [], excludeType, excludeId, limit = 10 }) {
  const models = getModels();
  const scored = [];

  for (const [type, Model] of Object.entries(models)) {
    const orClauses = [
      sport && { sport },
      productType && { productType },
      tags?.length && { tags: { $in: tags } },
    ].filter(Boolean);
    if (orClauses.length === 0) continue;

    const query = { $or: orClauses };
    // Only exclude by _id within the SAME type - ObjectIds aren't
    // guaranteed unique *across* different collections.
    if (type === excludeType && excludeId) {
      query._id = { $ne: excludeId };
    }

    const candidates = await Model.find(query).limit(50).lean();
    candidates.forEach((item) =>
      scored.push({ contentType: type, item, score: scoreRelevance({ sport, productType, tags }, item) })
    );
  }

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = { getRelatedContent, suggestRelatedContent, scoreRelevance };
