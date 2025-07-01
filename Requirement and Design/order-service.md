# Detailed Design: Order Service

This document provides a detailed design for the Order Service, which is responsible for managing shopping carts, orders, and the checkout process.

## 1. Responsibilities

-   Manage the user's shopping cart.
-   Create and manage orders.
-   Handle the checkout process, coordinating with the Payment Service.
-   Publish events to the message broker (RabbitMQ) when order statuses change.

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

model Order {
  id        String      @id @default(cuid())
  userId    String
  status    OrderStatus @default(PROCESSING)
  total     Float
  items     Json        // Denormalized list of product details
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model Cart {
  id        String   @id @default(cuid())
  userId    String   @unique
  items     Json     // Denormalized list of product details
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum OrderStatus {
  PROCESSING
  PAID
  SHIPPED
  DELIVERED
  CANCELED
}
```

**Note on `Json` fields:** The `items` field in both `Order` and `Cart` will store a JSON array of objects. Each object will be a denormalized snapshot of the product at the time of purchase, including `productId`, `name`, `price`, and `quantity`.

## 3. API Endpoints & Logic

### Cart Management

#### `GET /api/cart`
-   **Description:** Gets the current user's cart.
-   **Logic:** Find the cart by `userId`. If not found, create a new empty cart.

#### `POST /api/cart/items`
-   **Description:** Adds an item to the cart.
-   **Logic:** Add the item to the `items` JSON array. If the item already exists, increment the quantity.

#### `PUT /api/cart/items/:id`
-   **Description:** Updates the quantity of an item in the cart.
-   **Logic:** Update the quantity for the specified item in the `items` JSON array.

#### `DELETE /api/cart/items/:id`
-   **Description:** Removes an item from the cart.
-   **Logic:** Remove the item from the `items` JSON array.

### Order Management

#### `POST /api/orders`
-   **Description:** Creates one or more new orders from the user's cart. The items in the cart are grouped by their `walletAddress`, and a separate order is created for each wallet address.
-   **Logic:**
    1.  Retrieve the user's cart.
    2.  Group the items in the cart by `walletAddress`.
    3.  For each group of items, create a new `Order` with a `PROCESSING` status.
    4.  Clear the user's cart.
    5.  Publish an `OrderCreated` event for each created order to RabbitMQ.

#### `GET /api/orders`
-   **Description:** Gets a list of the current user's orders.
-   **Logic:** Find all orders associated with the `userId`.

#### `GET /api/orders/:id`
-   **Description:** Gets a single order by ID.
-   **Logic:** Find the order by `id`, ensuring it belongs to the current user.

### Admin Endpoints

#### `GET /api/admin/orders`
-   **Description:** (Admin) Gets a list of all orders.
-   **Logic:** Return all orders from the database.

#### `PUT /api/admin/orders/:id/status`
-   **Description:** (Admin) Updates the status of an order.
-   **Logic:** Update the `status` of the order. Publish an `OrderStatusUpdated` event.

## 4. Asynchronous Communication

-   **Event Publishing:**
    -   `OrderCreated`: Published when a new order is created. This might be consumed by a notification service.
    -   `OrderPaid`: Published when a payment is successfully processed. This will be consumed by the Product Service to update inventory.
    -   `OrderStatusUpdated`: Published when an admin changes the order status (e.g., to `SHIPPED`).
