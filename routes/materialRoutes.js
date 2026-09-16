const materialController = require("../controllers/materialController");
const createContentRoutes = require("./contentRoutesFactory");

module.exports = createContentRoutes(materialController);
