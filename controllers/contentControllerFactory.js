const { getRelatedContent } = require("../services/relatedContentService");
const { assertReadyToPublish, PublishValidationError } = require("../services/publishValidation");
const slugify = require("../services/slugify");

/**
 * Portfolio, Journal, NewArrival, and Material all share the exact same
 * list/detail/CRUD shape (published-only public routes, full-access admin
 * routes, publish-time validation, related content on the detail route).
 * Rather than hand-write 4 nearly-identical controllers, this factory
 * builds one from a Model + its relatedContent contentType key.
 */
function createContentController(Model, contentType) {
  // GET / - public, published only. Supports ?sport=&productType=&tag=&featured=&page=&limit=
  async function listPublished(req, res) {
    try {
      const { sport, productType, tag, featured, page = 1, limit = 20 } = req.query;
      const query = { status: "published" };
      if (sport) query.sport = sport;
      if (productType) query.productType = productType;
      if (tag) query.tags = tag;
      if (featured === "true") query.featured = true;

      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(50, Math.max(1, Number(limit) || 20));

      const [items, count] = await Promise.all([
        Model.find(query)
          .sort({ featured: -1, publishedAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Model.countDocuments(query),
      ]);

      res.json({ success: true, count, page: pageNum, data: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /slug/:slug - public, published only, includes related content.
  async function getBySlug(req, res) {
    try {
      const item = await Model.findOne({ slug: req.params.slug, status: "published" });
      if (!item) {
        return res.status(404).json({ success: false, message: `${contentType} not found` });
      }
      const related = await getRelatedContent(contentType, item);
      res.json({ success: true, data: item, related });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /admin - admin-protected, every status, for the admin panel's list table.
  async function adminList(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const query = {};
      if (status) query.status = status;

      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

      const [items, count] = await Promise.all([
        Model.find(query)
          .sort({ updatedAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Model.countDocuments(query),
      ]);

      res.json({ success: true, count, page: pageNum, data: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /admin/:id - admin-protected, any status, for the edit form.
  async function adminGetById(req, res) {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: `${contentType} not found` });
      }
      res.json({ success: true, data: item });
    } catch (err) {
      if (err.name === "CastError") {
        return res.status(400).json({ success: false, message: `Invalid ${contentType} id` });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST / - admin-protected create.
  async function create(req, res) {
    try {
      const body = { ...req.body };
      if (!body.slug && body.title) body.slug = slugify(body.title);
      if (!body.slug && body.name) body.slug = slugify(body.name); // Material uses "name" not "title"

      assertReadyToPublish(contentType, body);
      if (body.status === "published" && !body.publishedAt) body.publishedAt = new Date();

      const item = await Model.create(body);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      if (err instanceof PublishValidationError || err.name === "ValidationError") {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "Slug already in use" });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // PUT /:id - admin-protected update.
  async function update(req, res) {
    try {
      const existing = await Model.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `${contentType} not found` });
      }

      const merged = { ...existing.toObject(), ...req.body };
      assertReadyToPublish(contentType, merged);

      const body = { ...req.body };
      if (body.status === "published" && !existing.publishedAt && !body.publishedAt) {
        body.publishedAt = new Date();
      }

      const item = await Model.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
      });
      res.json({ success: true, data: item });
    } catch (err) {
      if (err instanceof PublishValidationError || err.name === "ValidationError") {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err.name === "CastError") {
        return res.status(400).json({ success: false, message: `Invalid ${contentType} id` });
      }
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "Slug already in use" });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // DELETE /:id - admin-protected delete.
  async function remove(req, res) {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: `${contentType} not found` });
      }
      res.json({ success: true, data: item });
    } catch (err) {
      if (err.name === "CastError") {
        return res.status(400).json({ success: false, message: `Invalid ${contentType} id` });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }

  return { listPublished, getBySlug, adminList, adminGetById, create, update, remove };
}

module.exports = createContentController;
