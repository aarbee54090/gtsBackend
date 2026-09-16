const NewArrival = require("../models/NewArrival");
const createContentController = require("./contentControllerFactory");

module.exports = createContentController(NewArrival, "new-arrival");
