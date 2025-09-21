const express = require("express");
const router = express.Router();
const searchController = require("../controller/search.js")

//search route
router.get("/", searchController.search)

module.exports = router;