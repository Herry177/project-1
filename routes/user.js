const express = require("express");
const router = express.Router();
const User = require("../modules/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveredirectUrl } = require("../miiddleware.js");
const { commonPasswords } = require("../commonpasses.js")
const userController = require("../controller/user.js")

router.route("/signup")
//signup routes
.get(userController.signupFormRender)
.post(
  wrapAsync(userController.signupPostRoute)
);

router.route("/login")
//login routes
.get(userController.loginFormRender)
.post(
  saveredirectUrl, 
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.loginPostRoute
);

//logout route

router.get("/logout", userController.logout);

module.exports = router;
