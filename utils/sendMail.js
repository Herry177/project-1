const nodemailer = require("nodemailer");

async function sendVerificationEmail(to, code) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Verify Your Trippeo Account",
        text: `Your verification code is: ${code}`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendVerificationEmail;