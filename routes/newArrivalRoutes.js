const newArrivalController = require("../controllers/newArrivalController");
const createContentRoutes = require("./contentRoutesFactory");

module.exports = createContentRoutes(newArrivalController);
