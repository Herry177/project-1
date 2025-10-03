const User = require("../modules/user.js");
const { commonPasswords } = require("../commonpasses.js");
const sendVerificationEmail = require("../utils/sendMail"); 

// The duration for code validity (10 minutes in milliseconds)
const CODE_VALIDITY_DURATION = 10 * 60 * 1000; 

// -------------------------------------------------------------------
// 1. SIGNUP
// -------------------------------------------------------------------

module.exports.signupFormRender = (req, res) => {
    res.render("user/signUp.ejs");
};

// FIX: Added email failure handling and user deletion.
module.exports.signupPostRoute = async (req, res, next) => {
    let registeredUser; // Declare outside try/catch for scope

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

        // 1. Register the user
        registeredUser = await User.register(newUser, password);
        
        // 2. Attempt to send verification email with error recovery (THE FIX)
        try {
            await sendVerificationEmail(registeredUser.email, code);
        } catch (emailError) {
            console.error("Email Sending Failed:", emailError);
            // CRITICAL FIX: If email fails, delete the user from the database
            await User.findByIdAndDelete(registeredUser._id);
            req.flash("error", "Error sending verification email. Please check service configuration and try again.");
            return res.redirect("/signup");
        }

        // 3. Success logic
        req.flash("success", "A verification code has been sent to your email.");
        res.redirect(`/verify?email=${encodeURIComponent(registeredUser.email)}`);

    } catch (e) {
        // This catch handles errors from User.register (e.g., duplicate username/email)
        console.error("Signup Error:", e);
        // Note: If the email failed and we deleted the user, this catch won't run.
        // This handles errors *before* the email step, like duplicate registration.
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

/**
 * @description Processes the verification code, only forcing re-signup if the code has expired.
 * @note This is the refactored function.
 */
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