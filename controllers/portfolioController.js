const PortfolioProject = require("../models/PortfolioProject");
const createContentController = require("./contentControllerFactory");

module.exports = createContentController(PortfolioProject, "portfolio");
