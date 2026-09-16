const portfolioController = require("../controllers/portfolioController");
const createContentRoutes = require("./contentRoutesFactory");

module.exports = createContentRoutes(portfolioController);
