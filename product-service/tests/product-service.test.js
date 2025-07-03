const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

// Constants for amqplib mock
const mockAmqpChannelAck = jest.fn();
const mockAmqpChannelNack = jest.fn();
let capturedConsumeCallback; // To capture and manually trigger consume callback

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
        // Mock prisma.order if product-service's event handlers for OrderPaid/OrderCanceled
        // were to actually use it (currently they use event.data.items or have it commented out)
        /*
        order: {
            findUnique: jest.fn(),
        }
        */
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// Mock amqplib
jest.mock('amqplib', () => ({
    connect: jest.fn().mockResolvedValue({ // Ensure connect returns a Promise
        createChannel: jest.fn().mockResolvedValue({ // Ensure createChannel returns a Promise
            assertQueue: jest.fn().mockResolvedValue(undefined),
            publish: jest.fn(), // Product service doesn't publish, but good to have
            consume: jest.fn((queue, callback) => {
                capturedConsumeCallback = callback; // Capture the callback
                // console.log(`Mock amqp: consume called for queue ${queue}, callback captured.`);
            }),
            ack: mockAmqpChannelAck,
            nack: mockAmqpChannelNack,
        }),
    }),
}));

// Mock Auth Middleware
jest.mock('../src/middleware/auth', () => ({
    authenticateJWT: jest.fn((req, res, next) => {
        req.isAdmin = req.headers['x-admin'] === 'true';
        next();
    })
}));

const prisma = new PrismaClient(); // Instance of mocked PrismaClient

// Import the actual app after mocks are set up
// process.env.RABBITMQ_URL = 'amqp://testhost'; // Example if specific test URL needed for RabbitMQ mock
const { app, server } = require('../src/index');

// This code runs once after all tests in this file are done.
afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
});

describe('Product Service API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset captured consume callback before each test if it's triggered per test
        // capturedConsumeCallback = undefined; // This might be too early if app setup is async
        mockAmqpChannelAck.mockClear();
        mockAmqpChannelNack.mockClear();

        // Ensure the Prisma mock methods are cleared if they are reused across tests
        // This happens automatically with jest.clearAllMocks() for jest.fn() instances
        // on the mPrismaClient object returned by the PrismaClient mock constructor.
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
            prisma.product.findMany.mockResolvedValue([]); // Default mock response
            await request(app).get('/api/products?search=Product');
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
            prisma.product.findMany.mockResolvedValue([]); // Default mock response
            await request(app).get('/api/products?sortBy=price&order=desc');
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
        });

        test('should return 404 if product not found', async () => {
            prisma.product.findUnique.mockResolvedValue(null);
            const res = await request(app).get('/api/products/nonexistent');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /api/products', () => {
        test('should create a new product if admin', async () => {
            const newProductData = { name: 'New Product', description: 'Desc', price: 10, imageUrl: 'url', walletAddress: 'addr', stock: 5 };
            prisma.product.create.mockResolvedValue({ id: 'newProdId', ...newProductData });

            const res = await request(app)
                .post('/api/products')
                .set('x-admin', 'true')
                .send(newProductData);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id', 'newProdId');
        });

        test('should return 403 if not admin', async () => {
            const res = await request(app).post('/api/products').send({});
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('PUT /api/products/:id', () => {
        test('should update an existing product if admin', async () => {
            const updatedProductData = { name: 'Updated Product' };
            prisma.product.update.mockResolvedValue({ id: 'prod1', ...updatedProductData });

            const res = await request(app)
                .put('/api/products/prod1')
                .set('x-admin', 'true')
                .send(updatedProductData);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 'prod1');
        });

        test('should return 403 if not admin', async () => {
            const res = await request(app).put('/api/products/prod1').send({});
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('DELETE /api/products/:id', () => {
        test('should delete a product if admin', async () => {
            prisma.product.delete.mockResolvedValue({}); // Return value doesn't usually matter for delete
            const res = await request(app)
                .delete('/api/products/prod1')
                .set('x-admin', 'true');
            expect(res.statusCode).toEqual(204);
        });

        test('should return 403 if not admin', async () => {
            const res = await request(app).delete('/api/products/prod1');
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('RabbitMQ Event Consumption', () => {
        // Helper to wait for async operations within consume callback if any were truly async
        const flushPromises = () => new Promise(setImmediate);

        test('should decrement stock and increment preservedStock on OrderCreated event', async () => {
            // Ensure capturedConsumeCallback is defined (app has initialized RabbitMQ connection)
            // This might require a small delay or a more robust way to await RabbitMQ connection in tests
            await flushPromises(); // Wait for connectRabbitMQ to potentially run
            if (!capturedConsumeCallback) {
                 // If connectRabbitMQ hasn't completed and set capturedConsumeCallback yet
                 // we might need to wait. Forcing it for test assumes it would be set.
                console.warn("capturedConsumeCallback not set, RabbitMQ mock might not have been fully initialized by app.")
                const amqp = require('amqplib'); // get the mock
                capturedConsumeCallback = amqp.connect().createChannel().consume.mock.calls[0][1];
            }
            if (!capturedConsumeCallback) throw new Error("Consume callback not captured");


            const msg = {
                content: Buffer.from(JSON.stringify({
                    eventName: 'OrderCreated',
                    data: { items: [{ productId: 'prod1', quantity: 2 }] }
                })),
                fields: { deliveryTag: 1 } // Mock deliveryTag
            };
            await capturedConsumeCallback(msg);
            await flushPromises(); // Allow async operations inside callback to complete

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod1' },
                data: {
                    stock: { decrement: 2 },
                    preservedStock: { increment: 2 }
                }
            });
            expect(mockAmqpChannelAck).toHaveBeenCalledWith(msg);
        });

        test('should decrement preservedStock on OrderPaid event', async () => {
            await flushPromises();
            if (!capturedConsumeCallback) throw new Error("Consume callback not captured for OrderPaid test");

            // In src/index.js, OrderPaid handler uses data.items if available,
            // and the commented out prisma.order.findUnique is not used.
            // So, we don't need to mock prisma.order.findUnique for this test based on current src.
            const msg = {
                content: Buffer.from(JSON.stringify({
                    eventName: 'OrderPaid',
                    // IMPORTANT: The actual src/index.js for OrderPaid relies on data.items,
                    // or a prisma.order.findUnique call (which is commented out).
                    // For this test to align with the *current* code that uses event.data.items,
                    // the event data must contain items.
                    data: { orderId: 'order1', items: [{ productId: 'prod1', quantity: 2 }] }
                })),
                fields: { deliveryTag: 2 }
            };
            await capturedConsumeCallback(msg);
            await flushPromises();

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod1' },
                data: {
                    preservedStock: { decrement: 2 }
                }
            });
            expect(mockAmqpChannelAck).toHaveBeenCalledWith(msg);
        });

        test('should increment stock and decrement preservedStock on OrderCanceled event', async () => {
            await flushPromises();
            if (!capturedConsumeCallback) throw new Error("Consume callback not captured for OrderCanceled test");

            // Similar to OrderPaid, ensure event data has items if src/index.js relies on it.
            const msg = {
                content: Buffer.from(JSON.stringify({
                    eventName: 'OrderCanceled',
                    data: { orderId: 'order1', items: [{ productId: 'prod1', quantity: 2 }] }
                })),
                fields: { deliveryTag: 3 }
            };
            await capturedConsumeCallback(msg);
            await flushPromises();

            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 'prod1' },
                data: {
                    stock: { increment: 2 },
                    preservedStock: { decrement: 2 }
                }
            });
            expect(mockAmqpChannelAck).toHaveBeenCalledWith(msg);
        });
    });
});
