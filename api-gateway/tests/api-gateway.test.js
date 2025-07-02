const request = require('supertest');
const express = require('express');
const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');

// Mock the express app and proxy for testing purposes
const app = express();
app.use(express.json());

// Mock JWT secret
process.env.JWT_SECRET = 'test_jwt_secret';

// Mock authentication middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            req.headers['X-User-Id'] = user.userId; // Simulate X-User-Id header
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Mock public routes
const publicRoutes = [
    { method: 'POST', path: '/api/auth/login' },
    { method: 'POST', path: '/api/auth/register' },
    { method: 'GET', path: '/api/products' }
];

// Mock conditional authentication middleware
app.use((req, res, next) => {
    const isPublic = publicRoutes.some(route => {
        const pathMatches = req.path.startsWith(route.path);
        const methodMatches = req.method.toUpperCase() === route.method.toUpperCase();
        return pathMatches && methodMatches;
    });

    if (isPublic) {
        return next();
    }
    return authenticateJWT(req, res, next);
});

// Mock downstream services
const mockUserService = express();
mockUserService.get('/api/users/me', (req, res) => res.status(200).json({ id: req.headers['x-user-id'], email: 'test@example.com' }));
mockUserService.post('/api/auth/login', (req, res) => res.status(200).json({ message: 'Logged in' }));
mockUserService.post('/api/auth/register', (req, res) => res.status(201).json({ message: 'Registered' }));

const mockProductService = express();
mockProductService.get('/api/products', (req, res) => res.status(200).json([{ id: 'prod1', name: 'Product 1' }]));

const mockOrderService = express();
mockOrderService.get('/api/orders', (req, res) => res.status(200).json([{ id: 'order1' }]));

const mockPaymentService = express();
mockPaymentService.post('/api/payments/charge', (req, res) => res.status(200).json({ message: 'Payment initiated' }));

// Apply proxy routes to the mock app
app.use('/api/auth', proxy('http://localhost:3001', { forwardPath: (req) => `/api/auth${req.url}` }));
app.use('/api/users', proxy('http://localhost:3001', { forwardPath: (req) => `/api/users${req.url}` }));
app.use('/api/products', proxy('http://localhost:3002', { forwardPath: (req) => `/api/products${req.url}` }));
app.use('/api/cart', proxy('http://localhost:3003', { forwardPath: (req) => `/api/cart${req.url}` }));
app.use('/api/orders', proxy('http://localhost:3003', { forwardPath: (req) => `/api/orders${req.url}` }));
app.use('/api/admin/orders', proxy('http://localhost:3003', { forwardPath: (req) => `/api/admin/orders${req.url}` }));
app.use('/api/payments', proxy('http://localhost:3004', { forwardPath: (req) => `/api/payments${req.url}` }));

describe('API Gateway', () => {
    let userServiceServer, productServiceServer, orderServiceServer, paymentServiceServer;

    beforeAll(() => {
        userServiceServer = mockUserService.listen(3001);
        productServiceServer = mockProductService.listen(3002);
        orderServiceServer = mockOrderService.listen(3003);
        paymentServiceServer = mockPaymentService.listen(3004);
    });

    afterAll(() => {
        userServiceServer.close();
        productServiceServer.close();
        orderServiceServer.close();
        paymentServiceServer.close();
    });

    const generateToken = (userId) => {
        return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    };

    describe('Public Routes', () => {
        test('should allow access to /api/auth/login without token', async () => {
            const res = await request(app).post('/api/auth/login').send({});
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Logged in');
        });

        test('should allow access to /api/auth/register without token', async () => {
            const res = await request(app).post('/api/auth/register').send({});
            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toEqual('Registered');
        });

        test('should allow access to GET /api/products without token', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([{ id: 'prod1', name: 'Product 1' }]);
        });
    });

    describe('Protected Routes', () => {
        test('should deny access to /api/users/me without token', async () => {
            const res = await request(app).get('/api/users/me');
            expect(res.statusCode).toEqual(401);
        });

        test('should deny access to /api/users/me with invalid token', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', 'Bearer invalidtoken');
            expect(res.statusCode).toEqual(403);
        });

        test('should allow access to /api/users/me with valid token', async () => {
            const token = generateToken('user123');
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.id).toEqual('user123');
        });

        test('should allow access to /api/orders with valid token', async () => {
            const token = generateToken('user123');
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([{ id: 'order1' }]);
        });

        test('should allow access to /api/payments/charge with valid token', async () => {
            const token = generateToken('user123');
            const res = await request(app)
                .post('/api/payments/charge')
                .set('Authorization', `Bearer ${token}`)
                .send({ orderId: 'order123', amount: 100 });
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Payment initiated');
        });
    });

    // Note: Rate limiting is hard to test with supertest as it's usually IP-based
    // and supertest requests often originate from the same local IP.
    // This would typically be tested with integration tests or by mocking the rate-limit middleware.
});
