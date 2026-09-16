const JournalArticle = require("../models/JournalArticle");
const createContentController = require("./contentControllerFactory");

module.exports = createContentController(JournalArticle, "journal");
