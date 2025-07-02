const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const authRouter = require('../src/routes/auth'); // Adjust path to your auth router
const usersRouter = require('../src/routes/users'); // Adjust path to your user router
const authMiddleware = require('../src/middleware/auth'); // Adjust path to your auth middleware

// 1. Mock PrismaClient correctly
jest.mock('@prisma/client', () => {
    const mPrisma = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

// 2. Mock passport but keep it simple
jest.mock('passport');
jest.mock('passport-discord');

// 3. Mock the authentication middleware directly for protected routes
jest.mock('../src/middleware/auth', () => jest.fn((req, res, next) => {
    // ✅ REQUIRE the module INSIDE the factory function
    const jwt = require('jsonwebtoken');

    // Check for a specific header in tests to simulate success
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.userId }; // Attach user object
            next();
        } catch (error) {
            // Simulate an invalid token scenario
            if (token === 'invalidtoken') {
                return res.status(403).json({ message: 'Forbidden' });
            }
            // Allow other errors to pass through or handle as needed
            next(error);
        }
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}));


// Set up a test instance of the Express app
const app = express();
app.use(express.json());
app.use(passport.initialize());
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);


describe('User Service API', () => {
    let prisma;

    beforeAll(() => {
        // Set up environment variables
        process.env.JWT_SECRET = 'test_jwt_secret';
        process.env.DISCORD_CLIENT_ID = 'test_discord_client_id';
        process.env.DISCORD_CLIENT_SECRET = 'test_discord_client_secret';
        process.env.DISCORD_CALLBACK_URL = 'http://localhost:3001/api/auth/discord/callback';
    });

    beforeEach(() => {
        // Get a new mock instance for each test
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('GET /api/auth/discord', () => {
        test('should call passport.authenticate for the discord strategy', async () => {
            passport.authenticate.mockImplementation((strategy, options) => {
                return (req, res, next) => {
                    res.status(200).send('Passport Authenticate Mocked');
                };
            });

            await request(app).get('/api/auth/discord');
            // Check that passport.authenticate was called with 'discord'
            expect(passport.authenticate).toHaveBeenCalledWith('discord', { scope: ['identify', 'email'] });
        });
    });

    describe('GET /api/auth/discord/callback', () => {
        test('should create a new user and redirect with a JWT if user does not exist', async () => {
            const mockUser = { id: 'newUserId', discordId: 'mockDiscordId', email: 'mock@example.com' };

            passport.authenticate.mockImplementation((strategy, options, callback) => (req, res, next) => {
                req.user = mockUser;
                next();
            });

            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue(mockUser);

            const res = await request(app).get('/api/auth/discord/callback?code=somecode');

            expect(res.statusCode).toEqual(302); // Should redirect
            expect(res.headers.location).toMatch(/token=/); // Should redirect with a token

            const token = new URL(res.headers.location).searchParams.get('token');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            expect(decoded.userId).toEqual('newUserId');
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    discordId: 'mockDiscordId',
                    email: 'mock@example.com',
                },
            });
        });

        test('should log in an existing user and redirect with a JWT', async () => {
            const existingUser = { id: 'existingUserId', discordId: 'mockDiscordId', email: 'mock@example.com' };
            passport.authenticate.mockImplementation((strategy, options, callback) => (req, res, next) => {
                req.user = existingUser;
                next();
            });

            prisma.user.findUnique.mockResolvedValue(existingUser);

            const res = await request(app).get('/api/auth/discord/callback?code=somecode');

            expect(res.statusCode).toEqual(302); // Should redirect
            expect(res.headers.location).toMatch(/token=/);

            const token = new URL(res.headers.location).searchParams.get('token');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            expect(decoded.userId).toEqual('existingUserId');
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });

    describe('GET /api/users/me', () => {
        test('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/users/me');
            expect(res.statusCode).toEqual(401);
        });

        test('should return 403 if token is invalid', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', 'Bearer invalidtoken');
            expect(res.statusCode).toEqual(403);
        });

        test('should return user profile with a valid token', async () => {
            const user = { id: 'testUserId', email: 'test@example.com', discordId: '123' };
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            prisma.user.findUnique.mockResolvedValue(user);

            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(user);
            expect(authMiddleware).toHaveBeenCalled();
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: user.id } });
        });
    });

    describe('PUT /api/users/me', () => {
        test('should update user email with a valid token', async () => {
            const user = { id: 'testUserId', email: 'old@example.com' };
            const updatedUser = { ...user, email: 'new@example.com' };
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            prisma.user.update.mockResolvedValue(updatedUser);

            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'new@example.com' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedUser);
            expect(authMiddleware).toHaveBeenCalled();
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: user.id },
                data: { email: 'new@example.com' },
            });
        });
    });
});