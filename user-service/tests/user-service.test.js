const request = require('supertest');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');

// Mock PrismaClient
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// Mock Passport and its strategies
jest.mock('passport', () => ({
    initialize: jest.fn(() => (req, res, next) => next()),
    use: jest.fn(),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn(),
    // ✅ CORRECTED MOCK: `authenticate` now returns a function, as Express expects.
    authenticate: jest.fn((strategy, options) => {
        // This function will be called within the tests to simulate different outcomes.
        return (req, res, next) => {
            // If a specific test provides a user, attach it to the request.
            if (passport.authenticate.mock.user) {
                req.user = passport.authenticate.mock.user;
            }
            next();
        };
    }),
}));
jest.mock('passport-discord');

// Import the app *after* all mocks are set up
const { app, server } = require('../src/index');
const prisma = new PrismaClient();

// This code runs once after all tests in this file are done.
afterAll(async () => {
    // We need to wait for the server to close before Jest can exit.
    await new Promise(resolve => server.close(resolve));
});

describe('User Service API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear any user set by a previous test
        delete passport.authenticate.mock.user;
        process.env.JWT_SECRET = 'test-secret';
    });

    // --- Authentication Routes ---
    describe('GET /api/auth/discord', () => {
        it('should attempt to authenticate with discord', async () => {
            await request(app).get('/api/auth/discord');
            // Check that passport.authenticate was called for the 'discord' strategy
            expect(passport.authenticate).toHaveBeenCalledWith('discord');
        });
    });

    describe('GET /api/auth/discord/callback', () => {
        it('should handle successful authentication and return a JWT', async () => {
            const mockUser = { id: 'user123', email: 'test@example.com' };
            // Set the user that the mock should return
            passport.authenticate.mock.user = mockUser;

            const response = await request(app).get('/api/auth/discord/callback');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');

            // Verify the token contains the correct user ID
            const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
            expect(decoded.userId).toBe(mockUser.id);
        });
    });

    // --- Protected User Routes ---
    describe('GET /api/users/me', () => {
        it('should return 401 Unauthorized if no token is provided', async () => {
            const response = await request(app).get('/api/users/me');
            expect(response.status).toBe(401);
        });

        it('should return 403 Forbidden for an invalid token', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set('Authorization', 'Bearer invalidtoken');
            expect(response.status).toBe(403);
        });

        it('should return user data for a valid token', async () => {
            const user = { id: 'user123', email: 'test@example.com' };
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            prisma.user.findUnique.mockResolvedValue(user);

            const response = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: user.id } });
        });
    });

    describe('PUT /api/users/me', () => {
        it('should update the user profile for a valid token', async () => {
            const user = { id: 'user123', email: 'old@example.com' };
            const updatedUser = { ...user, email: 'new@example.com' };
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

            prisma.user.update.mockResolvedValue(updatedUser);

            const response = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'new@example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedUser);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: user.id },
                data: { email: 'new@example.com' },
            });
        });
    });
});