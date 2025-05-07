const nodemailer = require('nodemailer');

let transporter = null;

async function createTransport() {
    if (transporter) return transporter;

    if (process.env.NODE_ENV === 'production') {
        // Use production SMTP settings
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Use Ethereal for development
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
    return transporter;
}

async function sendVerificationEmail(email, token) {
    const transport = await createTransport();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const info = await transport.sendMail({
        from: '"Your App" <noreply@yourapp.com>',
        to: email,
        subject: "Please verify your email",
        text: `Please verify your email by clicking: ${verificationUrl}`,
        html: `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">Verify Email</a>
        `
    });

    // Log preview URL in development
    if (process.env.NODE_ENV !== 'production') {
        console.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
}

async function sendPasswordResetEmail(email, token) {
    const transport = await createTransport();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const info = await transport.sendMail({
        from: '"Your App" <noreply@yourapp.com>',
        to: email,
        subject: "Password Reset Request",
        text: `Please reset your password by clicking: ${resetUrl}
               This link will expire in 1 hour.
               If you did not request this, please ignore this email.`,
        html: `
            <h1>Password Reset Request</h1>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
        `
    });

    // Log preview URL in development
    if (process.env.NODE_ENV !== 'production') {
        console.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return info;
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};