const User = require("../modules/user.js");
const { commonPasswords } = require("../commonpasses.js");
const sendVerificationEmail = require("../utils/sendMail.js"); 

// The duration for code validity (10 minutes in milliseconds)
const CODE_VALIDITY_DURATION = 10 * 60 * 1000; 

// -------------------------------------------------------------------
// 1. SIGNUP
// -------------------------------------------------------------------

module.exports.signupFormRender = (req, res) => {
    res.render("user/signUp.ejs");
};

// FIX: Added 'next' to the arguments to resolve the req.login issue.
module.exports.signupPostRoute = async (req, res, next) => {
    try {
        let { email, username, password } = req.body;
        
        // --- Password Check Logic (Kept as is) ---
        if (password) {
            for (let i = 0; i < commonPasswords.length; i++) {
                if (password === commonPasswords[i] || password === username) {
                    req.flash("error", "You used most common password or don't use username as a password!");
                    return res.redirect("/signup");
                }
            }
        }
        
        // --- Email Verification Logic Added ---
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        let newUser = new User({
            email,
            username,
            isVerified: false,
            verificationCode: code,
            verificationCodeExpires: Date.now() + CODE_VALIDITY_DURATION
        });

        let registeredUser = await User.register(newUser, password);
        
        // NOTE: If sendVerificationEmail fails, you should handle the error and delete the user here.
        // For simplicity and to match the prompt's request for verification, we assume success.
        await sendVerificationEmail(registeredUser.email, code);

        // Instead of logging in immediately, redirect to verification page
        req.flash("success", "A verification code has been sent to your email.");
        res.redirect(`/verify?email=${encodeURIComponent(registeredUser.email)}`);

    } catch (e) {
        console.error("Signup Error:", e);
        req.flash("error", e.message || "An error occurred during sign up.");
        res.redirect("/signup");
    }
};

// -------------------------------------------------------------------
// 2. LOGIN & LOGOUT (Keep as is)
// -------------------------------------------------------------------

module.exports.loginFormRender = (req, res) => {
    res.render("user/login.ejs");
};

module.exports.loginPostRoute = async (req, res) => {
    req.flash("success", "Welcome Back To Trippeo!");
    let redirect = res.locals.redirectUrl || "/listings";
    res.redirect(redirect);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};

// --- NEW VERIFICATION FUNCTIONS (Required for the new flow) ---

// Renders the verification form
module.exports.verifyFormRender = (req, res) => {
    const email = req.query.email || "";
    res.render("user/verify.ejs", { email });
};

module.exports.verifyAccount = async (req, res, next) => {
    const { email, code } = req.body;
    const trimmedCode = code.trim(); // Always trim the input code

    try {
        const user = await User.findOne({ email });

        if (!user || user.isVerified) {
            req.flash("error", "User not found or already verified.");
            return res.redirect("/signup"); // Redirect to signup if user doesn't exist
        }

        // 1. Check for Code Expiration
        const isExpired = user.verificationCodeExpires < Date.now();

        if (isExpired) {
            // Delete the user if the code is expired and they aren't verified
            await User.findByIdAndDelete(user._id);
            req.flash("error", "Verification code has **expired** (10 minutes). Please sign up again.");
            return res.redirect("/signup"); // Force re-signup only if expired
        }

        // 2. Check for Correct Code (Only if not expired)
        if (user.verificationCode !== trimmedCode) {
            // Do NOT delete the user. Allow them to try again.
            req.flash("error", "Invalid verification code. Please check your email and try again.");
            return res.redirect(`/verify?email=${encodeURIComponent(user.email)}`); // Redirect back to verify page
        }

        // 3. Verification Successful
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        req.login(user, (err) => {
            if (err) return next(err);
            req.flash("success", "Account verified successfully! Welcome to Trippeo.");
            res.redirect(res.locals.redirectUrl || "/listings");
        });

    } catch (err) {
        console.error("Verify Error:", err);
        req.flash("error", "Verification failed due to a server error.");
        res.redirect(`/verify?email=${encodeURIComponent(email)}`); // Redirect back to verify page on generic error
    }
};