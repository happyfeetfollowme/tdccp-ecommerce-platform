require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const amqp = require('amqplib');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('order_events', { durable: true });
        console.log('Connected to RabbitMQ');

        channel.consume('order_events', async (msg) => {
            if (msg !== null) {
                const { eventName, data } = JSON.parse(msg.content.toString());
                console.log(`Received event: ${eventName}`, data);

                try {
                    switch (eventName) {
                        case 'OrderCreated':
                            for (const item of data.items) {
                                await prisma.product.update({
                                    where: { id: item.productId },
                                    data: {
                                        stock: { decrement: item.quantity },
                                        preservedStock: { increment: item.quantity }
                                    }
                                });
                            }
                            break;
                        case 'OrderPaid':
                            // Assuming data.items is available from the original order for stock adjustment
                            // If not, you might need to fetch the order details from the order service
                            // For now, let's assume data.items contains the product details
                            const order = await prisma.order.findUnique({ where: { id: data.orderId } }); // This would require a direct call to order service or denormalization
                            if (order && order.items) {
                                for (const item of order.items) {
                                    await prisma.product.update({
                                        where: { id: item.productId },
                                        data: {
                                            preservedStock: { decrement: item.quantity }
                                        }
                                    });
                                }
                            }
                            break;
                        case 'OrderCanceled':
                            // Similar to OrderPaid, assuming data.items or fetching order details
                            const canceledOrder = await prisma.order.findUnique({ where: { id: data.orderId } });
                            if (canceledOrder && canceledOrder.items) {
                                for (const item of canceledOrder.items) {
                                    await prisma.product.update({
                                        where: { id: item.productId },
                                        data: {
                                            stock: { increment: item.quantity },
                                            preservedStock: { decrement: item.quantity }
                                        }
                                    });
                                }
                            }
                            break;
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.error(`Error processing event ${eventName}:`, error);
                    // Requeue message if processing fails
                    channel.nack(msg);
                }
            }
        }, { noAck: false });

    } catch (error) {
        console.error('Error connecting to RabbitMQ or consuming messages:', error);
        setTimeout(connectRabbitMQ, 5000); // Retry connection after 5 seconds
    }
}

connectRabbitMQ();

const authenticateJWT = (req, res, next) => {
    // This is a placeholder for JWT authentication. In a real app,
    // you'd validate the token and extract user roles.
    // For now, we'll assume all requests are authenticated and
    // admin status is determined by a header for demonstration.
    req.isAdmin = req.headers['x-admin'] === 'true';
    next();
};

// API Endpoints
app.get('/api/products', async (req, res) => {
    const { search, sortBy, order } = req.query;
    const where = {};
    const orderBy = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (sortBy) {
        orderBy[sortBy] = order || 'asc';
    }

    const products = await prisma.product.findMany({
        where,
        orderBy
    });
    res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
        return res.status(404).send('Product not found');
    }
    res.json(product);
});

app.post('/api/products', authenticateJWT, async (req, res) => {
    if (!req.isAdmin) {
        return res.status(403).send('Forbidden');
    }
    const { name, description, price, imageUrl, walletAddress, stock } = req.body;
    const product = await prisma.product.create({
        data: { name, description, price, imageUrl, walletAddress, stock }
    });
    res.status(201).json(product);
});

app.put('/api/products/:id', authenticateJWT, async (req, res) => {
    if (!req.isAdmin) {
        return res.status(403).send('Forbidden');
    }
    const { id } = req.params;
    const { name, description, price, imageUrl, walletAddress, stock } = req.body;
    const updatedProduct = await prisma.product.update({
        where: { id },
        data: { name, description, price, imageUrl, walletAddress, stock }
    });
    res.json(updatedProduct);
});

app.delete('/api/products/:id', authenticateJWT, async (req, res) => {
    if (!req.isAdmin) {
        return res.status(403).send('Forbidden');
    }
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
});

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
    console.log(`Product service listening on port ${PORT}`);
});

module.exports = { app, server };
