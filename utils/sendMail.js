const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE || 'gmail', 
    auth: {
        user: process.env.NODEMAILER_USER, // Your email address
        pass: process.env.NODEMAILER_PASS  // Your email password or application-specific password
    }
});

// 2. Define the Exported Function
async function sendVerificationEmail(email, code) {
    if (!process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) {
        // Log a warning if environment variables are missing
        console.warn("Nodemailer credentials are NOT set. Skipping email send.");
        // Throw an error so the signup route knows the email failed
        throw new Error("Email service is not configured."); 
    }

    const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: "Trippeo Account Verification Code",
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

    // 3. Send the email
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error; // Rethrow to be caught in the controller
    }
};

// 4. Export the function
module.exports = sendVerificationEmail;