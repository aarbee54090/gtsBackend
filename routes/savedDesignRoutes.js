const express = require("express");
const requireCustomer = require("../middlewares/requireCustomer");
const savedDesignController = require("../controllers/savedDesignController");

const router = express.Router();

router.use(requireCustomer);
router.get("/", savedDesignController.listMine);
router.post("/", savedDesignController.save);
router.delete("/:itemType/:itemId", savedDesignController.unsave);

module.exports = router;
