const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const amqp = require('amqplib');

// Mock PrismaClient
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        product: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

// Mock amqplib
jest.mock('amqplib', () => ({
    connect: jest.fn(() => ({
        createChannel: jest.fn(() => ({
            assertQueue: jest.fn(),
            publish: jest.fn(),
            consume: jest.fn((queue, callback) => {
                // Simulate a message being consumed for testing purposes
                // This can be expanded to trigger specific events for testing
                // For now, we'll just acknowledge the message if it's called
                callback({ content: Buffer.from(JSON.stringify({ eventName: 'testEvent', data: {} })), fields: { deliveryTag: 1 } });
            }),
            ack: jest.fn(),
            nack: jest.fn(),
        })),
    })),
}));

// Import the actual app after mocks are set up
const { app, server } = require('../src/index');

// This code runs once after all tests in this file are done.
afterAll(async () => {
    // We need to wait for the server to close before Jest can exit.
    await new Promise(resolve => server.close(resolve));
});

describe('Product Service API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock the authenticateJWT middleware to always pass and set isAdmin based on header
        app._router.stack.forEach((middleware) => {
            if (middleware.handle.name === 'authenticateJWT') {
                middleware.handle = (req, res, next) => {
                    req.isAdmin = req.headers['x-admin'] === 'true';
                    next();
                };
            }
        });
    });

    describe('GET /api/products', () => {
        test('should return a list of products', async () => {
            const mockProducts = [{ id: 'prod1', name: 'Product 1' }];
            prisma.product.findMany.mockResolvedValue(mockProducts);

            const res = await request(app).get('/api/products');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockProducts);
            expect(prisma.product.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: {},
            });
        });

        test('should filter products by search term', async () => {
            const mockProducts = [{ id: 'prod1', name: 'Product A', description: 'Desc A' }];
            prisma.product.findMany.mockResolvedValue(mockProducts);

            const res = await request(app).get('/api/products?search=Product');

            expect(res.statusCode).toEqual(200);
            expect(prisma.product.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { name: { contains: 'Product', mode: 'insensitive' } },
                        { description: { contains: 'Product', mode: 'insensitive' } },
                    ],
                },
                orderBy: {},
            });
        });

        test('should sort products', async () => {
            const mockProducts = [{ id: 'prod1', name: 'Product A', price: 10 }];
            prisma.product.findMany.mockResolvedValue(mockProducts);

            const res = await request(app).get('/api/products?sortBy=price&order=desc');

            expect(res.statusCode).toEqual(200);
            expect(prisma.product.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: { price: 'desc' },
            });
        });
    });

    describe('GET /api/products/:id', () => {
        test('should return a single product by ID', async () => {
            const mockProduct = { id: 'prod1', name: 'Product 1' };
            prisma.product.findUnique.mockResolvedValue(mockProduct);

            const res = await request(app).get('/api/products/prod1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockProduct);
            expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 'prod1' } });
        });

        test('should return 404 if product not found', async () => {
            prisma.product.findUnique.mockResolvedValue(null);

            const res = await request(app).get('/api/products/nonexistent');

            expect(res.statusCode).toEqual(404);
            expect(res.text).toEqual('Product not found');
        });
    });

    describe('POST /api/products', () => {
        test('should create a new product if admin', async () => {
            const newProduct = { name: 'New Product', description: 'Desc', price: 10, imageUrl: 'url', walletAddress: 'addr', stock: 5 };
            prisma.product.create.mockResolvedValue({ id: 'newProdId', ...newProduct });

            const res = await request(app)
                .post('/api/products')
                .set('x-admin', 'true')
                .send(newProduct);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id', 'newProdId');
            expect(prisma.product.create).toHaveBeenCalledWith({ data: newProduct });
        });

        test('should return 403 if not admin', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({});
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('PUT /api/products/:id', () => {
        test('should update an existing product if admin', async () => {
            const updatedProduct = { name: 'Updated Product', description: 'Desc', price: 15, imageUrl: 'url', walletAddress: 'addr', stock: 7 };
            prisma.product.update.mockResolvedValue({ id: 'prod1', ...updatedProduct });

            const res = await request(app)
                .put('/api/products/prod1')
                .set('x-admin', 'true')
                .send(updatedProduct);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 'prod1');
            expect(prisma.product.update).toHaveBeenCalledWith({ where: { id: 'prod1' }, data: updatedProduct });
        });

        test('should return 403 if not admin', async () => {
            const res = await request(app)
                .put('/api/products/prod1')
                .send({});
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('DELETE /api/products/:id', () => {
        test('should delete a product if admin', async () => {
            prisma.product.delete.mockResolvedValue({ id: 'prod1' });

            const res = await request(app)
                .delete('/api/products/prod1')
                .set('x-admin', 'true');

            expect(res.statusCode).toEqual(204);
            expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'prod1' } });
        });

        test('should return 403 if not admin', async () => {
            const res = await request(app)
                .delete('/api/products/prod1');
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('RabbitMQ Event Consumption', () => {
        test('should decrement stock and increment preservedStock on OrderCreated event', async () => {
            const mockProduct = { id: 'prod1', stock: 10, preservedStock: 0 };
            prisma.product.update.mockResolvedValue({});

            // Manually trigger the consume callback with an OrderCreated event
            const mockChannel = amqp.connect().createChannel();
            const consumeCallback = mockChannel.consume.mock.calls[0][1];
            const msg = {
                content: Buffer.from(JSON.stringify({
                    eventName: 'OrderCreated',
                    data: { items: [{ productId: 'prod1', quantity: 2 }] }
                })),
                fields: { deliveryTag: 1 }
            };
            await consumeCallback(msg);

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod1' },
                data: {
                    stock: { decrement: 2 },
                    preservedStock: { increment: 2 }
                }
            });
            expect(mockChannel.ack).toHaveBeenCalledWith(msg);
        });

        test('should decrement preservedStock on OrderPaid event', async () => {
            const mockProduct = { id: 'prod1', stock: 8, preservedStock: 2 };
            prisma.product.update.mockResolvedValue({});
            // Mock order service call for OrderPaid event
            // This is a simplification, in a real scenario, you might mock an HTTP call or a direct DB query
            // For this test, we'll assume the order data is directly available in the event for simplicity
            const mockOrder = { id: 'order1', items: [{ productId: 'prod1', quantity: 2 }] };
            prisma.order.findUnique.mockResolvedValue(mockOrder); // This mock is not actually used by product service, but for completeness

            const mockChannel = amqp.connect().createChannel();
            const consumeCallback = mockChannel.consume.mock.calls[0][1];
            const msg = {
                content: Buffer.from(JSON.stringify({
                    eventName: 'OrderPaid',
                    data: { orderId: 'order1', items: [{ productId: 'prod1', quantity: 2 }] }
                })),
                fields: { deliveryTag: 1 }
            };
            await consumeCallback(msg);

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod1' },
                data: {
                    preservedStock: { decrement: 2 }
                }
            });
            expect(mockChannel.ack).toHaveBeenCalledWith(msg);
        });

        test('should increment stock and decrement preservedStock on OrderCanceled event', async () => {
            const mockProduct = { id: 'prod1', stock: 8, preservedStock: 2 };
            prisma.product.update.mockResolvedValue({});
            // Mock order service call for OrderCanceled event
            const mockCanceledOrder = { id: 'order1', items: [{ productId: 'prod1', quantity: 2 }] };
            prisma.order.findUnique.mockResolvedValue(mockCanceledOrder); // This mock is not actually used by product service, but for completeness

            const mockChannel = amqp.connect().createChannel();
            const consumeCallback = mockChannel.consume.mock.calls[0][1];
            const msg = {
                content: Buffer.from(JSON.stringify({
                    eventName: 'OrderCanceled',
                    data: { orderId: 'order1', items: [{ productId: 'prod1', quantity: 2 }] }
                })),
                fields: { deliveryTag: 1 }
            };
            await consumeCallback(msg);

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod1' },
                data: {
                    stock: { increment: 2 },
                    preservedStock: { decrement: 2 }
                }
            });
            expect(mockChannel.ack).toHaveBeenCalledWith(msg);
        });
    });
});
