const User = require("../modules/user");
const sendVerificationEmail = require("../utils/sendMail");

// --- SIGNUP FORM ---
module.exports.signupFormRender = (req, res) => {
    res.render("user/signUp.ejs");
};

// --- SIGNUP POST ---
module.exports.signupPostRoute = async (req, res) => {
    try {
        let { email, username, password } = req.body;

        // 1. CHECK FOR EXISTING EMAIL (Unverified)
        let existingUser = await User.findOne({ email });

        if (existingUser && !existingUser.isVerified) {
            // User exists but is unverified - resend verification code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            existingUser.verificationCode = code;
            existingUser.verificationCodeExpires = Date.now() + 3600000; // 1h
            await existingUser.save();

            // Handle potential email sending failure here
            try {
                await sendVerificationEmail(existingUser.email, code);
            } catch (emailErr) {
                console.error("Email Resend Error:", emailErr);
                req.flash("error", "Error sending verification email. Please try again.");
                return res.redirect("/signup");
            }
            
            req.flash("success", "A new verification code has been sent to your email.");
            return res.redirect(`/verify?email=${encodeURIComponent(existingUser.email)}`);
        }

        // 2. CHECK FOR EXISTING EMAIL (Verified)
        if (existingUser && existingUser.isVerified) {
            req.flash("error", "This email is already registered. Please log in.");
            return res.redirect("/login");
        }

        // 3. NEW USER REGISTRATION
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        let newUser = new User({
            email,
            username,
            isVerified: false,
            verificationCode: code,
            verificationCodeExpires: Date.now() + 3600000
        });

        // This line can throw an error if username already exists
        let registeredUser = await User.register(newUser, password);

        // Handle potential email sending failure here
        try {
            await sendVerificationEmail(registeredUser.email, code);
        } catch (emailErr) {
            console.error("Initial Email Send Error:", emailErr);
            // Optionally: Delete the user if email failed to prevent unverified accounts
            // await User.findByIdAndDelete(registeredUser._id);
            req.flash("error", "User registered, but failed to send verification email. Please contact support.");
            return res.redirect("/signup");
        }

        req.flash("success", "A verification code has been sent to your email.");
        res.redirect(`/verify?email=${encodeURIComponent(registeredUser.email)}`);

    } catch (err) {
        console.error("Signup Error:", err);
        let errorMessage = "Registration failed. Please check your inputs.";

        // Passport-local-mongoose errors often have specific messages
        if (err.name === 'UserExistsError') {
            errorMessage = "A user with the given username is already registered.";
        } else if (err.code && err.code === 11000) {
            // Mongoose unique index violation (e.g., email or username if defined in schema)
             errorMessage = "A user with this email or username already exists.";
        } else {
             errorMessage = err.message || "An unknown error occurred during sign up.";
        }

        req.flash("error", errorMessage);
        res.redirect("/signup");
    }
};

// --- LOGIN FORM ---
module.exports.loginFormRender = (req, res) => {
    res.render("user/login.ejs");
};

// --- LOGIN POST ---
module.exports.loginPostRoute = (req, res) => {
    req.flash("success", "Welcome Back!");
    let redirect = res.locals.redirectUrl || "/";
    res.redirect(redirect);
};

// --- LOGOUT ---
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/");
    });
};

// --- VERIFY FORM ---
module.exports.verifyFormRender = (req, res) => {
    const email = req.query.email || "";
    res.render("user/verify.ejs", { email });
};

// --- VERIFY ACCOUNT ---
// CRITICAL FIX: Added 'next' to the arguments to resolve the req.login issue.
module.exports.verifyAccount = async (req, res, next) => {
    const { email, code } = req.body;

    if (!email) {
        req.flash("error", "Verification email missing. Please sign up again.");
        return res.redirect("/signup");
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/signup");
        }

        if (user.verificationCode !== code.trim() || user.verificationCodeExpires < Date.now()) {
            req.flash("error", "Invalid or expired code.");
            return res.redirect(`/verify?email=${encodeURIComponent(email)}`);
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        req.login(user, (err) => {
            // 'next' is now defined and handles errors
            if (err) return next(err); 
            req.flash("success", "Account verified successfully!");
            // Redirect to the stored URL (from pre-login attempt) or default
            res.redirect(res.locals.redirectUrl || "/"); 
        });
    } catch (err) {
        console.error("Verify Error:", err);
        req.flash("error", err.message);
        res.redirect("/verify");
    }
};