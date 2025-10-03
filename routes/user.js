const express = require("express");
const router = express.Router();
const User = require("../modules/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveredirectUrl } = require("../miiddleware.js");
const { commonPasswords } = require("../commonpasses.js");
const userController = require("../controller/user.js");

// -------------------------------------------------------------------
// SIGNUP ROUTE
// -------------------------------------------------------------------
router.route("/signup")
.get(userController.signupFormRender)
.post(
    wrapAsync(userController.signupPostRoute)
);

// -------------------------------------------------------------------
// LOGIN ROUTE
// -------------------------------------------------------------------
router.route("/login")
.get(userController.loginFormRender)
.post(
    saveredirectUrl, 
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    
    // 💥 IMPROVEMENT: Check verification status and handle immediate logout
    (req, res, next) => {
        if (req.user && !req.user.isVerified) {
            // Log out the user immediately after passport logs them in
            req.logout((err) => {
                // Handle the rare logout error, then proceed with redirect
                if (err) {
                    console.error("Logout error during verification check:", err);
                    req.flash("error", "An error occurred during logout. Please try logging in again.");
                    return res.redirect("/login");
                }
                
                // User is successfully logged out (session cleared).
                // Now, flash the error and redirect to the verify page.
                req.flash("error", "Please verify your email to log in.");
                return res.redirect(`/verify?email=${encodeURIComponent(req.user.email)}`);
            });
        } else {
            // User is verified, proceed to the final login handler
            next();
        }
    },
    userController.loginPostRoute // Final handler for verified users
);

// -------------------------------------------------------------------
// LOGOUT ROUTE
// -------------------------------------------------------------------
router.get("/logout", userController.logout);

// -------------------------------------------------------------------
// EMAIL VERIFICATION ROUTES
// -------------------------------------------------------------------
router.get("/verify", userController.verifyFormRender);
router.post("/verify", wrapAsync(userController.verifyAccount));

module.exports = router;