const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authLimiter, registrationLimiter } = require('../middleware/rateLimiter');
const { 
    registerValidation, 
    loginValidation, 
    passwordResetValidation,
    resetPasswordValidation,
    validate 
} = require('../middleware/validation');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();

// Google OAuth routes
router.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email']
    })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/?error=google-auth-failed' 
    }),
    (req, res) => {
        // Create JWT token for the authenticated user
        const token = jwt.sign(
            { userId: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        res.redirect('/?success=google-auth-success');
    }
);

// Register a new user
router.post('/register', 
    registrationLimiter, 
    registerValidation,
    validate,
    async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Hash password with increased security
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        
        // Generate verification token
        const verificationToken = user.generateVerificationToken();
        
        await user.save();
        
        // Send verification email
        await sendVerificationEmail(email, verificationToken);
        
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            user: user.toPublicJSON()
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Email or username already exists'
                }
            });
        }
        res.status(400).json({
            success: false,
            error: {
                message: error.message
            }
        });
    }
});

// Login user
router.post('/login',
    authLimiter,
    loginValidation,
    validate,
    async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid login credentials');
        }
        
        if (!user.isVerified) {
            throw new Error('Please verify your email before logging in');
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid login credentials');
        }
        
        const token = jwt.sign(
            { 
                userId: user._id,
                sessionId: require('crypto').randomBytes(32).toString('hex')
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({
            success: true,
            user: user.toPublicJSON()
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: {
                message: error.message
            }
        });
    }
});

// Verify email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            throw new Error('Invalid or expired verification token');
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        
        res.json({
            success: true,
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: {
                message: error.message
            }
        });
    }
});

// Resend verification email
router.post('/resend-verification',
    authLimiter,
    async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        if (user.isVerified) {
            throw new Error('Email is already verified');
        }
        
        const verificationToken = user.generateVerificationToken();
        await user.save();
        
        await sendVerificationEmail(email, verificationToken);
        
        res.json({
            success: true,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: {
                message: error.message
            }
        });
    }
});

// Request password reset
router.post('/forgot-password',
    authLimiter,
    passwordResetValidation,
    validate,
    async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            
            if (!user) {
                // Return success even if user not found (security through obscurity)
                return res.json({
                    success: true,
                    message: 'If an account exists with that email, a password reset link will be sent.'
                });
            }
            
            const resetToken = user.generatePasswordResetToken();
            await user.save();
            
            await sendPasswordResetEmail(email, resetToken);
            
            res.json({
                success: true,
                message: 'If an account exists with that email, a password reset link will be sent.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: {
                    message: 'Error processing password reset request'
                }
            });
        }
    }
);

// Reset password with token
router.post('/reset-password',
    authLimiter,
    resetPasswordValidation,
    validate,
    async (req, res) => {
        try {
            const { token, password } = req.body;
            
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            
            if (!user) {
                throw new Error('Invalid or expired password reset token');
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 12);
            
            // Update user password and clear reset token
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            res.json({
                success: true,
                message: 'Password has been reset successfully. You can now log in with your new password.'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message
                }
            });
        }
    }
);

// Protected routes below this line
router.use(auth);

// Get current user profile
router.get('/profile', async (req, res) => {
    res.json({
        success: true,
        user: req.user.toPublicJSON()
    });
});

// Update user profile
router.patch('/profile', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Invalid updates'
            }
        });
    }
    
    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json({
            success: true,
            user: req.user.toPublicJSON()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: {
                message: error.message
            }
        });
    }
});

// Logout user
router.post('/logout', async (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;