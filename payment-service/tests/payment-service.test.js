const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const solanaPay = require('@solana/pay');
const amqp = require('amqplib');

// Mock PrismaClient
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        payment: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
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
            consume: jest.fn(),
        })),
    })),
}));

// Mock Solana web3.js and solana-pay functions
jest.mock('@solana/web3.js', () => ({
    Connection: jest.fn(() => ({})),
    PublicKey: jest.fn((key) => ({ toString: () => key })),
    Keypair: {
        generate: jest.fn(() => ({
            publicKey: { toString: () => 'mockReferencePublicKey' },
        })),
    },
    Transaction: jest.fn(),
    // Mock BN if it's used directly, otherwise it might be part of @solana/pay
    BN: jest.fn((value) => value),
}));

jest.mock('@solana/pay', () => ({
    createQR: jest.fn(),
    encodeURL: jest.fn(() => ({ toString: () => 'mockSolanaPayUrl' })),
    findReference: jest.fn(),
    validateTransfer: jest.fn(),
    FindReferenceError: jest.fn(() => new Error('FindReferenceError')),
    ValidateTransferError: jest.fn(() => new Error('ValidateTransferError')),
}));

// Mock environment variables
process.env.SOLANA_RPC_URL = 'http://mock-solana-rpc';
process.env.SHOP_WALLET_ADDRESS = 'mockShopWalletAddress';
process.env.RABBITMQ_URL = 'amqp://localhost';

// Import the actual app after mocks are set up
const { app, server } = require('../src/index');

// This code runs once after all tests in this file are done.
afterAll(async () => {
    // We need to wait for the server to close before Jest can exit.
    await new Promise(resolve => server.close(resolve));
});

describe('Payment Service API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/payments/charge', () => {
        test('should initiate a payment and return Solana Pay URL', async () => {
            const mockPayment = { id: 'payment123', orderId: 'order1', amount: 100, status: 'PENDING' };
            prisma.payment.create.mockResolvedValue(mockPayment);

            const res = await request(app)
                .post('/api/payments/charge')
                .send({ orderId: 'order1', amount: 100, recipientWallet: 'mockRecipientWallet' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('paymentId', 'payment123');
            expect(res.body).toHaveProperty('solanaPayUrl', 'mockSolanaPayUrl');
            expect(res.body).toHaveProperty('reference', 'mockReferencePublicKey');
            expect(prisma.payment.create).toHaveBeenCalledWith({
                data: {
                    orderId: 'order1',
                    amount: 100,
                    status: 'PENDING',
                    transaction: null,
                },
            });
            expect(solanaPay.encodeURL).toHaveBeenCalled();
        });

        test('should return 400 if required fields are missing', async () => {
            const res = await request(app).post('/api/payments/charge').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Missing orderId, amount, or recipientWallet');
        });
    });

    describe('GET /api/payments/verify', () => {
        test('should verify a payment and update status to COMPLETED', async () => {
            const mockPayment = { id: 'payment123', orderId: 'order1', amount: 100, status: 'PENDING' };
            const updatedPayment = { ...mockPayment, status: 'COMPLETED', transaction: 'mockSignature' };

            prisma.payment.findUnique.mockResolvedValue(mockPayment);
            solanaPay.findReference.mockResolvedValue({ signature: 'mockSignature' });
            solanaPay.validateTransfer.mockResolvedValue(true);
            prisma.payment.update.mockResolvedValue(updatedPayment);

            const res = await request(app)
                .get('/api/payments/verify?reference=mockReference&paymentId=payment123');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'COMPLETED');
            expect(res.body).toHaveProperty('transaction', 'mockSignature');
            expect(prisma.payment.update).toHaveBeenCalledWith({
                where: { id: 'payment123' },
                data: { status: 'COMPLETED', transaction: 'mockSignature' },
            });
            expect(amqp.connect().createChannel().publish).toHaveBeenCalledWith(
                '', 'order_events', Buffer.from(JSON.stringify({ eventName: 'OrderPaid', data: { orderId: 'order1', paymentId: 'payment123', transaction: 'mockSignature' } }))
            );
        });

        test('should return 404 if payment record not found', async () => {
            prisma.payment.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/payments/verify?reference=mockReference&paymentId=nonExistentPayment');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Payment record not found');
        });

        test('should return 404 if transaction not found on Solana', async () => {
            const mockPayment = { id: 'payment123', orderId: 'order1', amount: 100, status: 'PENDING' };
            prisma.payment.findUnique.mockResolvedValue(mockPayment);
            solanaPay.findReference.mockImplementation(() => { throw new solanaPay.FindReferenceError(); });

            const res = await request(app)
                .get('/api/payments/verify?reference=mockReference&paymentId=payment123');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Transaction not found');
        });

        test('should return 400 if transaction validation fails', async () => {
            const mockPayment = { id: 'payment123', orderId: 'order1', amount: 100, status: 'PENDING' };
            prisma.payment.findUnique.mockResolvedValue(mockPayment);
            solanaPay.findReference.mockResolvedValue({ signature: 'mockSignature' });
            solanaPay.validateTransfer.mockImplementation(() => { throw new solanaPay.ValidateTransferError(); });

            const res = await request(app)
                .get('/api/payments/verify?reference=mockReference&paymentId=payment123');

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Transaction validation failed');
        });
    });
});
