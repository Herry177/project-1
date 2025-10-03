const express = require("express");
const router = express.Router();
const User = require("../modules/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveredirectUrl } = require("../miiddleware.js");
const { commonPasswords } = require("../commonpasses.js");
const userController = require("../controller/user.js");

// -------------------------------------------------------------------
// SIGNUP ROUTE (Sign-up will no longer send verification email)
// -------------------------------------------------------------------
router.route("/signup")
  .get(userController.signupFormRender)
  .post(
    // NOTE: userController.signupPostRoute must be updated to NOT send email
    wrapAsync(userController.signupPostRoute)
  );

// -------------------------------------------------------------------
// LOGIN ROUTE (Direct login without verification check)
// -------------------------------------------------------------------
router.route("/login")
  .get(userController.loginFormRender)
  .post(
    saveredirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    // VERIFICATION CHECK MIDDLEWARE REMOVED HERE
    userController.loginPostRoute
  );

// -------------------------------------------------------------------
// LOGOUT ROUTE
// -------------------------------------------------------------------
router.get("/logout", userController.logout);

// -------------------------------------------------------------------
// EMAIL VERIFICATION ROUTES (REMOVED)
// -------------------------------------------------------------------
// router.get("/verify", userController.verifyFormRender); // REMOVED
// router.post("/verify", userController.verifyAccount); // REMOVED

module.exports = router;