const request = require('supertest');
const { PrismaClient } = require('@prisma/client'); // Ensure this is imported

// Define all constants needed by mocks first
const mockUserId = 'testUserId'; // Used by auth mock
const mockAmqpPublish = jest.fn(); // Used by amqplib mock structure
const mockAmqpChannel = {
    assertQueue: jest.fn(),
    publish: mockAmqpPublish,
    consume: jest.fn(),
};
const mockAmqpConnection = { // Used by amqplib mock
    createChannel: jest.fn().mockResolvedValue(mockAmqpChannel),
};

// Mock PrismaClient - this mock doesn't depend on the above constants
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        order: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        cart: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient(); // Make sure prisma instance is available for tests

// Mock amqplib - uses mockAmqpConnection
jest.mock('amqplib', () => ({
    connect: jest.fn().mockResolvedValue(mockAmqpConnection),
}));

// Mock the authenticateJWT middleware - uses mockUserId
jest.mock('../src/middleware/auth', () => ({
    authenticateJWT: jest.fn((req, res, next) => {
        req.userId = mockUserId;
        if (req.headers['x-admin'] === 'true') {
            req.isAdmin = true; // For admin tests
        }
        next();
    })
}));

// Import everything needed for shutdown from your app
// This MUST come AFTER all jest.mock calls
const { app, server } = require('../src/index'); // Must be after jest.mock

// This code runs once after all tests in this file are done.
afterAll(async () => {
    // We need to wait for the server to close before Jest can exit.
    await new Promise(resolve => server.close(resolve));
});

describe('Order Service API', () => {
    // mockUserId is already defined above for the mock

    beforeEach(() => {
        jest.clearAllMocks();
        // The console logs for app and app._router can be removed now.
        // The problematic app._router.stack manipulation is also removed.
    });

    describe('Cart Management', () => {
        test('GET /api/cart - should return an existing cart', async () => {
            const mockCart = { id: 'cart1', userId: mockUserId, items: [] };
            prisma.cart.findUnique.mockResolvedValue(mockCart);

            const res = await request(app).get('/api/cart').set('x-user-id', mockUserId);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockCart);
            expect(prisma.cart.findUnique).toHaveBeenCalledWith({ where: { userId: mockUserId } });
        });

        test('GET /api/cart - should create a new cart if none exists', async () => {
            prisma.cart.findUnique.mockResolvedValue(null);
            const newCart = { id: 'newCart1', userId: mockUserId, items: [] };
            prisma.cart.create.mockResolvedValue(newCart);

            const res = await request(app).get('/api/cart').set('x-user-id', mockUserId);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(newCart);
            expect(prisma.cart.create).toHaveBeenCalledWith({ data: { userId: mockUserId, items: [] } });
        });

        test('POST /api/cart/items - should add a new item to cart', async () => {
            const mockCart = { id: 'cart1', userId: mockUserId, items: [] };
            prisma.cart.findUnique.mockResolvedValue(mockCart);
            const updatedCart = { ...mockCart, items: [{ productId: 'prod1', name: 'Product 1', price: 10, quantity: 1, walletAddress: 'wallet1' }] };
            prisma.cart.update.mockResolvedValue(updatedCart);

            const res = await request(app)
                .post('/api/cart/items')
                .set('x-user-id', mockUserId)
                .send({ productId: 'prod1', name: 'Product 1', price: 10, quantity: 1, walletAddress: 'wallet1' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedCart);
            expect(prisma.cart.update).toHaveBeenCalled();
        });

        test('PUT /api/cart/items/:id - should update item quantity', async () => {
            const mockCart = { id: 'cart1', userId: mockUserId, items: [{ productId: 'prod1', name: 'Product 1', price: 10, quantity: 1, walletAddress: 'wallet1' }] };
            prisma.cart.findUnique.mockResolvedValue(mockCart);
            const updatedCart = { ...mockCart, items: [{ productId: 'prod1', name: 'Product 1', price: 10, quantity: 5, walletAddress: 'wallet1' }] };
            prisma.cart.update.mockResolvedValue(updatedCart);

            const res = await request(app)
                .put('/api/cart/items/prod1')
                .set('x-user-id', mockUserId)
                .send({ quantity: 5 });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedCart);
            expect(prisma.cart.update).toHaveBeenCalled();
        });

        test('DELETE /api/cart/items/:id - should remove an item from cart', async () => {
            const mockCart = { id: 'cart1', userId: mockUserId, items: [{ productId: 'prod1', name: 'Product 1', price: 10, quantity: 1, walletAddress: 'wallet1' }] };
            prisma.cart.findUnique.mockResolvedValue(mockCart);
            const updatedCart = { ...mockCart, items: [] };
            prisma.cart.update.mockResolvedValue(updatedCart);

            const res = await request(app)
                .delete('/api/cart/items/prod1')
                .set('x-user-id', mockUserId);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedCart);
            expect(prisma.cart.update).toHaveBeenCalled();
        });
    });

    describe('Order Management', () => {
        test('POST /api/orders - should create orders from cart and clear cart', async () => {
            const mockCart = {
                id: 'cart1',
                userId: mockUserId,
                items: [
                    { productId: 'prod1', name: 'P1', price: 10, quantity: 1, walletAddress: 'walletA' },
                    { productId: 'prod2', name: 'P2', price: 20, quantity: 1, walletAddress: 'walletB' },
                ],
            };
            prisma.cart.findUnique.mockResolvedValue(mockCart);
            prisma.order.create.mockImplementation((data) => Promise.resolve({ id: 'orderId', ...data.data }));
            prisma.cart.update.mockResolvedValue({ ...mockCart, items: [] });

            const res = await request(app).post('/api/orders').set('x-user-id', mockUserId);

            expect(res.statusCode).toEqual(201);
            expect(res.body.length).toEqual(2); // Two orders created
            expect(prisma.order.create).toHaveBeenCalledTimes(2);
            expect(prisma.cart.update).toHaveBeenCalledWith({ where: { id: mockCart.id }, data: { items: [] } });
            expect(mockAmqpPublish).toHaveBeenCalledTimes(2); // Use the direct mock reference
        });

        test('GET /api/orders - should return user orders', async () => {
            const mockOrders = [{ id: 'order1', userId: mockUserId }];
            prisma.order.findMany.mockResolvedValue(mockOrders);

            const res = await request(app).get('/api/orders').set('x-user-id', mockUserId);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockOrders);
            expect(prisma.order.findMany).toHaveBeenCalledWith({ where: { userId: mockUserId } });
        });

        test('GET /api/orders/:id - should return a single order', async () => {
            const mockOrder = { id: 'order1', userId: mockUserId };
            prisma.order.findUnique.mockResolvedValue(mockOrder);

            const res = await request(app).get('/api/orders/order1').set('x-user-id', mockUserId);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockOrder);
            expect(prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 'order1', userId: mockUserId } });
        });
    });

    describe('Admin Endpoints', () => {
        // The beforeEach that caused issues is removed.
        // The global mock for authenticateJWT now handles the isAdmin logic based on 'x-admin' header.

        test('GET /api/admin/orders - should return all orders for admin', async () => {
            const mockOrders = [{ id: 'order1' }, { id: 'order2' }];
            prisma.order.findMany.mockResolvedValue(mockOrders);

            const res = await request(app).get('/api/admin/orders').set('x-user-id', mockUserId).set('x-admin', 'true');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockOrders);
            expect(prisma.order.findMany).toHaveBeenCalledWith();
        });

        test('PUT /api/admin/orders/:id - should update order status and publish event', async () => {
            const mockOrder = { id: 'order1', status: 'PROCESSING' };
            const updatedOrder = { ...mockOrder, status: 'SHIPPED' };
            prisma.order.update.mockResolvedValue(updatedOrder);

            const res = await request(app)
                .put('/api/admin/orders/order1')
                .set('x-user-id', mockUserId)
                .set('x-admin', 'true')
                .send({ status: 'SHIPPED' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(updatedOrder);
            expect(prisma.order.update).toHaveBeenCalledWith({ where: { id: 'order1' }, data: { status: 'SHIPPED' } });
            expect(mockAmqpPublish).toHaveBeenCalledWith( // Use the direct mock reference
                '', 'order_events', Buffer.from(JSON.stringify({ eventName: 'OrderStatusUpdated', data: { orderId: 'order1', newStatus: 'SHIPPED' } }))
            );
        });
    });
});