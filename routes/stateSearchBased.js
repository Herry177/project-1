const express = require("express");
const router = express.Router();
const itemsController = require("../controller/stateSearchBased.js");
const wrapAsync = require("../utils/wrapAsync.js");

// This route handles requests for a specific state and uses the
// controller to show all trending and 5-star listings, shops, and places
// in that state.
router.get(
  "/:statename", 
  wrapAsync(itemsController.showTrendingAndFiveStarByState)
);

module.exports = router;
