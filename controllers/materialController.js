const Material = require("../models/Material");
const createContentController = require("./contentControllerFactory");

module.exports = createContentController(Material, "material");
