const express = require("express");
const requireAdmin = require("../middlewares/requireAdmin");

function createContentRoutes(controller) {
  const router = express.Router();

  // Public
  router.get("/", controller.listPublished);
  router.get("/slug/:slug", controller.getBySlug);

  // Admin
  router.get("/admin", requireAdmin, controller.adminList);
  router.get("/admin/:id", requireAdmin, controller.adminGetById);
  router.post("/", requireAdmin, controller.create);
  router.put("/:id", requireAdmin, controller.update);
  router.delete("/:id", requireAdmin, controller.remove);

  return router;
}

module.exports = createContentRoutes;
