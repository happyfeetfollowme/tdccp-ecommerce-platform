
const express = require('express');
const proxy = require('express-http-proxy');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));
app.use(express.json());

// A key for signing the JWT. In a real application, this should be stored securely.
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

// Authentication middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).send('Access token is missing or invalid.');
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).send('Invalid token.');
            }

            // Attach user information to the request, including the userId
            req.user = user;
            // Pass the userId to downstream services in a custom header
            req.headers['X-User-Id'] = user.userId;
            next();
        });
    } else {
        res.status(401).send('Authorization header is missing.');
    }
};

// Public routes that do not require authentication
const publicRoutes = [
    { method: 'POST', path: '/api/auth/login' },
    { method: 'POST', path: '/api/auth/register' },
    { method: 'GET', path: '/api/products' }
];

// Middleware to conditionally apply JWT authentication
app.use((req, res, next) => {
    const isPublic = publicRoutes.some(route => {
        // Check if the request path starts with the route's path
        const pathMatches = req.path.startsWith(route.path);
        // Check if the method matches
        const methodMatches = req.method.toUpperCase() === route.method.toUpperCase();
        return pathMatches && methodMatches;
    });

    if (isPublic) {
        return next();
    }
    // For all other routes, apply authentication
    return authenticateJWT(req, res, next);
});


// Service URLs from environment variables for flexibility
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';


// Routing
app.use('/api/auth', proxy(USER_SERVICE_URL));
app.use('/api/users', proxy(USER_SERVICE_URL));
app.use('/api/products', proxy(PRODUCT_SERVICE_URL));
app.use('/api/cart', proxy(ORDER_SERVICE_URL));
app.use('/api/orders', proxy(ORDER_SERVICE_URL));
app.use('/api/admin/orders', proxy(ORDER_SERVICE_URL));
app.use('/api/payments', proxy(PAYMENT_SERVICE_URL));


// Generic error handler
app.use((err, req, res, next) => {
    console.error(`[API Gateway Error] ${err.stack}`);
    if (!res.headersSent) {
        res.status(500).send('An internal error occurred in the API Gateway.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
