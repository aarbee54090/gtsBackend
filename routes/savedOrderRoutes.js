const express = require("express");
const requireCustomer = require("../middlewares/requireCustomer");
const savedOrderController = require("../controllers/savedOrderController");

const router = express.Router();

router.use(requireCustomer);
router.get("/", savedOrderController.listMine);
router.post("/", savedOrderController.save);
router.delete("/:id", savedOrderController.remove);

module.exports = router;
