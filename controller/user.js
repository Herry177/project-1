const User = require("../modules/user.js");
const { commonPasswords } = require("../commonpasses.js");
const sendVerificationEmail = require("../utils/sendMail"); 

const CODE_VALIDITY_DURATION = 10 * 60 * 1000; 

// --- SIGNUP ---

module.exports.signupFormRender = (req, res) => {
    res.render("user/signUp.ejs");
};

module.exports.signupPostRoute = async (req, res, next) => {
    let registeredUser; 

    try {
        const { email, username, password } = req.body;
        
        // --- 1. Password/Username Validation ---
        if (password) {
            const isCommon = commonPasswords.includes(password);
            const isUsername = password === username;
            if (isCommon || isUsername) {
                req.flash("error", "Password is too common or matches your username!");
                return res.redirect("/signup");
            }
        }
        
        // --- 2. User Creation ---
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        let newUser = new User({
            email,
            username,
            isVerified: false,
            verificationCode: code,
            verificationCodeExpires: Date.now() + CODE_VALIDITY_DURATION
        });

        registeredUser = await User.register(newUser, password);
        
        // --- 3. Email Sending & Failure Recovery (Critical Fix) ---
        try {
            await sendVerificationEmail(registeredUser.email, code);
        } catch (emailError) {
            console.error("Email Sending Failed:", emailError.message);
            // Delete the user record to allow a clean re-signup
            await User.findByIdAndDelete(registeredUser._id);
            req.flash("error", `Account created but email failed. Please try again. Debug: ${emailError.message.substring(0, 50)}...`);
            return res.redirect("/signup");
        }

        // --- 4. Success ---
        req.flash("success", "A verification code has been sent to your email.");
        res.redirect(`/verify?email=${encodeURIComponent(registeredUser.email)}`);

    } catch (e) {
        console.error("Signup Error (Pre-Email or DB conflict):", e);
        req.flash("error", e.message || "An error occurred during sign up.");
        res.redirect("/signup");
    }
};

// --- LOGIN & LOGOUT (Unchanged) ---
module.exports.loginFormRender = (req, res) => { res.render("user/login.ejs"); };
module.exports.loginPostRoute = (req, res) => {
    req.flash("success", "Welcome Back To Trippeo!");
    res.redirect(res.locals.redirectUrl || "/listings");
};
module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};

// --- VERIFICATION ---

module.exports.verifyFormRender = (req, res) => {
    const email = req.query.email || "";
    res.render("user/verify.ejs", { email });
};

module.exports.verifyAccount = async (req, res, next) => {
    const { email, code } = req.body;
    const trimmedCode = code.trim();

    try {
        const user = await User.findOne({ email });

        if (!user || user.isVerified) {
            req.flash("error", "User not found or already verified.");
            return res.redirect("/signup");
        }

        const isExpired = user.verificationCodeExpires < Date.now();

        if (isExpired) {
            await User.findByIdAndDelete(user._id);
            req.flash("error", "Verification code has **expired**. Please sign up again.");
            return res.redirect("/signup");
        }

        if (user.verificationCode !== trimmedCode) {
            req.flash("error", "Invalid verification code.");
            return res.redirect(`/verify?email=${encodeURIComponent(user.email)}`);
        }

        // Verification Successful
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
        res.redirect(`/verify?email=${encodeURIComponent(email)}`);
    }
};