const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const State = require("../modules/state.js");
const stateController = require("../controller/state.js");

// Get all states
router.get("/", wrapAsync(stateController.index));

module.exports = router;
