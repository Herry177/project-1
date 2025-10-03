const express = require("express");
const router = express.Router();
const User = require("../modules/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveredirectUrl } = require("../miiddleware.js");
const { commonPasswords } = require("../commonpasses.js");
const userController = require("../controller/user.js");
const user = require("../modules/user.js");

// -------------------------------------------------------------------
// SIGNUP ROUTE
// -------------------------------------------------------------------
router.route("/signup")
    .get(userController.signupFormRender)
    .post(
        wrapAsync(userController.signupPostRoute)
    );

// -------------------------------------------------------------------
// LOCAL LOGIN ROUTE (Verification Check REMOVED)
// -------------------------------------------------------------------
router.route("/login")
    .get(userController.loginFormRender)
    .post(
        saveredirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        // 💥 VERIFICATION CHECK MIDDLEWARE REMOVED HERE
        userController.loginPostRoute
    );

// -------------------------------------------------------------------
// GOOGLE LOGIN ROUTES (KEPT)
// -------------------------------------------------------------------

// 1. Initiate Google authentication
router.get("/auth/google",
    saveredirectUrl, // Added saveredirectUrl for user convenience
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2. Google callback route
router.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    userController.loginPostRoute
);

router.get("/logout", userController.logout);

module.exports = router;