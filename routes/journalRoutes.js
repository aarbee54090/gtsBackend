const journalController = require("../controllers/journalController");
const createContentRoutes = require("./contentRoutesFactory");

module.exports = createContentRoutes(journalController);
