// Set environment variables for mock services BEFORE requiring the app
process.env.USER_SERVICE_URL = 'http://localhost:3001';
process.env.PRODUCT_SERVICE_URL = 'http://localhost:3002';
process.env.ORDER_SERVICE_URL = 'http://localhost:3003';
process.env.PAYMENT_SERVICE_URL = 'http://localhost:3004';
process.env.JWT_SECRET = 'test_jwt_secret';

const request = require('supertest');
const express = require('express');
// Note: We don't need `proxy` here anymore if the app itself uses the correct URLs.
// const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');

// Import everything needed for shutdown from your app AFTER setting env vars
const { app, server } = require('../src/index');

// This code runs once after all tests in this file are done.
afterAll(async () => {
    // We need to wait for the server to close before Jest can exit.
    await new Promise(resolve => server.close(resolve));
    // Reset any environment variables changed for testing if necessary,
    // though Jest typically runs tests in separate processes.
});


// It seems the test was trying to re-apply middleware that's already in src/index.js.
// This can lead to issues. The app from src/index.js should be tested as is.
// We rely on the environment variables to direct the app to mock services.

// Mock downstream services
const mockUserService = express();
mockUserService.use(express.json()); // Ensure mock services can parse JSON bodies
mockUserService.get('/me', (req, res) => { // Path changed from /api/users/me
    // Check for X-User-Id which should be set by authenticateJWT in the main app
    if (req.headers['x-user-id']) {
        res.status(200).json({ id: req.headers['x-user-id'], email: 'test@example.com' });
    } else {
        // This case might indicate an issue if a protected route reaches here without X-User-Id
        res.status(400).json({ message: 'X-User-Id header missing in mock user service' });
    }
});
mockUserService.post('/login', (req, res) => { // Path changed from /api/auth/login
    res.status(200).json({ message: 'Logged in' });
});
mockUserService.post('/register', (req, res) => { // Path changed from /api/auth/register
    res.status(201).json({ message: 'Registered' });
});

const mockProductService = express();
mockProductService.use(express.json());
// Path changed from /api/products. Assuming /api/products in gateway proxies to / at product service.
mockProductService.get('/', (req, res) => {
    res.status(200).json([{ id: 'prod1', name: 'Product 1' }]);
});

const mockOrderService = express();
mockOrderService.use(express.json());
// Path changed from /api/orders. Assuming /api/orders in gateway proxies to / at order service.
mockOrderService.get('/', (req, res) => {
    res.status(200).json([{ id: 'order1' }]);
});
// Add other necessary mock routes for order service if tests require them

const mockPaymentService = express();
mockPaymentService.use(express.json());
// Path changed from /api/payments/charge. Assuming /api/payments in gateway proxies /charge path.
mockPaymentService.post('/charge', (req, res) => {
    res.status(200).json({ message: 'Payment initiated' });
});


// The app imported from src/index.js is already configured with proxies.
// We don't need to apply them again here. The key is that it uses the
// environment variables we set above (e.g., process.env.USER_SERVICE_URL).

describe('API Gateway', () => {
    let userServiceServer, productServiceServer, orderServiceServer, paymentServiceServer;

    beforeAll(async () => {
        const startServer = (service, port) => new Promise((resolve, reject) => {
            const server = service.listen(port, () => {
                console.log(`Mock service listening on port ${port}`);
                resolve(server);
            });
            server.on('error', reject);
        });

        try {
            [
                userServiceServer,
                productServiceServer,
                orderServiceServer,
                paymentServiceServer
            ] = await Promise.all([
                startServer(mockUserService, 3001),
                startServer(mockProductService, 3002),
                startServer(mockOrderService, 3003),
                startServer(mockPaymentService, 3004)
            ]);
        } catch (error) {
            console.error("Failed to start mock servers", error);
            throw error; // Fail fast if servers don't start
        }
    });

    afterAll(async () => {
        const closeServer = (server) => new Promise((resolve, reject) => {
            if (server) {
                server.close(err => {
                    if (err) return reject(err);
                    resolve();
                });
            } else {
                resolve(); // Resolve if server isn't defined (e.g., setup failed)
            }
        });

        try {
            await Promise.all([
                closeServer(userServiceServer),
                closeServer(productServiceServer),
                closeServer(orderServiceServer),
                closeServer(paymentServiceServer)
            ]);
        } catch (error) {
            console.error("Failed to close mock servers", error);
            // Decide if you want to throw here or just log
        }
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
