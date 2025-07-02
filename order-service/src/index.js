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
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000); // Retry connection after 5 seconds
    }
}

connectRabbitMQ();

const publishEvent = (eventName, data) => {
    if (channel) {
        channel.publish('', 'order_events', Buffer.from(JSON.stringify({ eventName, data })));
        console.log(`Published event: ${eventName}`);
    } else {
        console.warn('RabbitMQ channel not available. Event not published.');
    }
};

const authenticateJWT = (req, res, next) => {
    // This is a placeholder. In a real application, this would validate a JWT
    // and extract the userId. For now, we'll assume a userId is passed in a header.
    const userId = req.headers['x-user-id'];
    if (userId) {
        req.userId = userId;
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Cart Management
app.get('/api/cart', authenticateJWT, async (req, res) => {
    let cart = await prisma.cart.findUnique({ where: { userId: req.userId } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId: req.userId, items: [] } });
    }
    res.json(cart);
});

app.post('/api/cart/items', authenticateJWT, async (req, res) => {
    const { productId, name, price, quantity, walletAddress } = req.body;
    let cart = await prisma.cart.findUnique({ where: { userId: req.userId } });

    if (!cart) {
        cart = await prisma.cart.create({ data: { userId: req.userId, items: [] } });
    }

    const items = cart.items ? JSON.parse(JSON.stringify(cart.items)) : [];
    const existingItemIndex = items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
        items[existingItemIndex].quantity += quantity;
    } else {
        items.push({ productId, name, price, quantity, walletAddress });
    }

    const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items: items }
    });
    res.json(updatedCart);
});

app.put('/api/cart/items/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const cart = await prisma.cart.findUnique({ where: { userId: req.userId } });

    if (!cart) {
        return res.status(404).send('Cart not found');
    }

    const items = cart.items ? JSON.parse(JSON.stringify(cart.items)) : [];
    const itemIndex = items.findIndex(item => item.productId === id);

    if (itemIndex > -1) {
        items[itemIndex].quantity = quantity;
        const updatedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: { items: items }
        });
        res.json(updatedCart);
    } else {
        res.status(404).send('Item not found in cart');
    }
});

app.delete('/api/cart/items/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const cart = await prisma.cart.findUnique({ where: { userId: req.userId } });

    if (!cart) {
        return res.status(404).send('Cart not found');
    }

    const items = cart.items ? JSON.parse(JSON.stringify(cart.items)) : [];
    const filteredItems = items.filter(item => item.productId !== id);

    const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items: filteredItems }
    });
    res.json(updatedCart);
});

// Order Management
app.post('/api/orders', authenticateJWT, async (req, res) => {
    const cart = await prisma.cart.findUnique({ where: { userId: req.userId } });

    if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).send('Cart is empty');
    }

    const itemsByWallet = cart.items.reduce((acc, item) => {
        const wallet = item.walletAddress || 'default'; // Group by walletAddress
        if (!acc[wallet]) {
            acc[wallet] = [];
        }
        acc[wallet].push(item);
        return acc;
    }, {});

    const createdOrders = [];
    for (const wallet in itemsByWallet) {
        const orderItems = itemsByWallet[wallet];
        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = await prisma.order.create({
            data: {
                userId: req.userId,
                status: 'PROCESSING',
                total,
                items: orderItems,
            }
        });
        createdOrders.push(order);
        publishEvent('OrderCreated', { orderId: order.id, userId: order.userId, items: order.items });
    }

    // Clear the cart after creating orders
    await prisma.cart.update({
        where: { id: cart.id },
        data: { items: [] }
    });

    res.status(201).json(createdOrders);
});

app.get('/api/orders', authenticateJWT, async (req, res) => {
    const orders = await prisma.order.findMany({ where: { userId: req.userId } });
    res.json(orders);
});

app.get('/api/orders/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id, userId: req.userId } });
    if (!order) {
        return res.status(404).send('Order not found');
    }
    res.json(order);
});

// Admin Endpoints
app.get('/api/admin/orders', authenticateJWT, async (req, res) => {
    // In a real app, you'd add admin role check here
    const orders = await prisma.order.findMany();
    res.json(orders);
});

app.put('/api/admin/orders/:id', authenticateJWT, async (req, res) => {
    // In a real app, you'd add admin role check here
    const { id } = req.params;
    const { status, shippingFee, total } = req.body;

    const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status, shippingFee, total }
    });

    if (status) {
        publishEvent('OrderStatusUpdated', { orderId: updatedOrder.id, newStatus: updatedOrder.status });
    }

    res.json(updatedOrder);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Order service listening on port ${PORT}`);
});
