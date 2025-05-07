const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/database');
require('dotenv').config();
require('./config/passport'); // Initialize passport configuration

const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "http:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"]
        }
    }
})); // Security headers
app.use(apiLimiter); // Rate limiting

// Session configuration
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Standard Middleware
app.use(morgan('dev')); // Logging
app.use(bodyParser.json()); // Parse JSON requests
app.use(cookieParser()); // Handle cookies
app.use(express.static('public')); // Serve static files

// CORS Configuration
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, _req, _res, _next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    _res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found'
        }
    });
});

app.listen(port, () => {
    const serverInfo = [
        `Server running in ${process.env.NODE_ENV || 'development'} mode`,
        `Server URL: http://localhost:${port}`,
        'API endpoints available at:',
        '- POST /api/users/register - Register a new user',
        '- POST /api/users/login - Login',
        '- GET /api/users/profile - Get user profile (requires auth)',
        '- POST /api/users/logout - Logout (requires auth)',
        '- PATCH /api/users/profile - Update profile (requires auth)'
    ];
    
    // Using console.info which is allowed by our ESLint config
    serverInfo.forEach(info => console.info(info));
});