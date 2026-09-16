const express = require("express");
const requireCustomer = require("../middlewares/requireCustomer");
const customerController = require("../controllers/customerController");

const router = express.Router();

router.post("/register", customerController.register);
router.post("/login", customerController.login);
router.post("/logout", customerController.logout);
router.get("/me", requireCustomer, customerController.me);
router.put("/me", requireCustomer, customerController.updateProfile);

module.exports = router;
