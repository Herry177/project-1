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

        let existingUser = await User.findOne({ email });

        if (existingUser && !existingUser.isVerified) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            existingUser.verificationCode = code;
            existingUser.verificationCodeExpires = Date.now() + 3600000; // 1h
            await existingUser.save();

            await sendVerificationEmail(existingUser.email, code);

            req.flash("success", "A new verification code has been sent to your email.");
            return res.redirect(`/verify?email=${encodeURIComponent(existingUser.email)}`);
        }

        if (existingUser && existingUser.isVerified) {
            req.flash("error", "This email is already registered. Please log in.");
            return res.redirect("/login");
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        let newUser = new User({
            email,
            username,
            isVerified: false,
            verificationCode: code,
            verificationCodeExpires: Date.now() + 3600000
        });

        let registeredUser = await User.register(newUser, password);

        await sendVerificationEmail(registeredUser.email, code);

        req.flash("success", "A verification code has been sent to your email.");
        res.redirect(`/verify?email=${encodeURIComponent(registeredUser.email)}`);
    } catch (err) {
        console.error("Signup Error:", err);
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

// --- LOGIN FORM ---
module.exports.loginFormRender = (req, res) => {
    res.render("user/login.ejs");
};

// --- LOGIN POST ---
module.exports.loginPostRoute = (req, res) => {
    req.flash("success", "Welcome Back To Trippeo!");
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
module.exports.verifyAccount = async (req, res) => {
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
            if (err) return next(err);
            console.log(user);
            req.flash("success", "Account verified successfully!");
            res.redirect(res.locals.redirectUrl || "/");
        });
    } catch (err) {
        console.error("Verify Error:", err);
        req.flash("error", err.message);
        res.redirect("/verify");
    }
};