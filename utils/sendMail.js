const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
   
    service: 'gmail', 
    host: 'smtp.gmail.com', 
    port: 465,             
    secure: true,         
    auth: {
        user: process.env.NODEMAILER_USER, 
        pass: process.env.NODEMAILER_PASS 
    }
});

async function sendVerificationEmail(email, code) {
    if (!process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) {
        console.error("Nodemailer credentials missing. Check environment variables.");
        throw new Error("Email service is not configured (Missing credentials)."); 
    }

    const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: "Trippeo Account Verification Code",
        // ... (HTML content as before) ...
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #38A169;">Verify Your Trippeo Account</h2>
                <p>Thank you for signing up! Please use the following code to complete your registration. This code is valid for 10 minutes.</p>
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 4px; text-align: center;">
                    <h1 style="color: #000000; margin: 0;">${code}</h1>
                </div>
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>The Trippeo Team</p>
            </div>
        `
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending verification email:", error.message || error);
        // Throw an error with the SMTP response if possible for better debugging
        throw new Error(`SMTP Error: ${error.response || error.message}`); 
    }
};

module.exports = sendVerificationEmail;