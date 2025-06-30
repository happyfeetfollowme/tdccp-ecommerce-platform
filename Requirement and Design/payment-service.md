# Detailed Design: Payment Service

This document provides a detailed design for the Payment Service, which is responsible for handling payment processing, specifically with Solana Pay.

## 1. Responsibilities

-   Initiating payment transactions for orders.
-   Integrating with Solana Pay to process payments.
-   Verifying the status of Solana Pay transactions.
-   Recording payment details and statuses.
-   Communicating with the Order Service to update order statuses upon successful payment.

## 2. Database Schema

The service will use a PostgreSQL database with the following Prisma schema.

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Payment {
  id          String   @id @default(cuid())
  orderId     String   @unique
  amount      Float
  status      String   // e.g., PENDING, COMPLETED, FAILED
  transaction String?  // Solana transaction signature
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 3. API Endpoints & Logic

### `POST /api/payments/charge`

-   **Description:** Initiates a payment for a specific order.
-   **Request Body:**
    ```json
    {
      "orderId": "ORDER_ID",
      "amount": 123.45
    }
    ```
-   **Logic:**
    1.  Validate the request body.
    2.  Create a `Payment` record in the database with a `PENDING` status.
    3.  Generate a Solana Pay payment request URL.
        -   This involves creating a transaction with the correct recipient, amount, and a unique reference ID (linking back to the `paymentId`).
    4.  Return the Solana Pay URL to the client.
    5.  The client-side application will then display this as a QR code for the user to scan with their Solana wallet.

### `GET /api/payments/verify`

-   **Description:** Verifies a payment transaction with the Solana blockchain.
-   **Query Parameters:**
    -   `transaction` (string): The Solana transaction signature.
-   **Logic:**
    1.  Query the Solana blockchain using the provided `transaction` signature to confirm the transaction.
    2.  Verify that the transaction details (recipient, amount) are correct.
    3.  If the transaction is valid and confirmed, update the corresponding `Payment` record in the database to `COMPLETED`.
    4.  Publish an `OrderPaid` event to RabbitMQ, including the `orderId` and payment details.
    5.  Return a `200 OK` response indicating success.
    6.  If the transaction is not found or invalid, return an appropriate error (`404 Not Found` or `400 Bad Request`).

## 4. Asynchronous Communication

-   **Event Publishing:**
    -   `OrderPaid`: This is the most critical event published by the Payment Service. When a payment is successfully verified, this event is sent to the message broker.
    -   **Consumer:** The **Order Service** will consume this event to update the status of the corresponding order from `PROCESSING` to `PAID`.
