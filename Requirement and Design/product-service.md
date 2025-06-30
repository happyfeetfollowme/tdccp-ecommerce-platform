# Detailed Design: Product Service

This document provides a detailed design for the Product Service, which is responsible for managing the product catalog and inventory.

## 1. Responsibilities

-   Managing products (CRUD operations).
-   Maintaining inventory levels for each product.
-   Providing endpoints for searching and filtering products.
-   Communicating with other services (e.g., the Order Service) to update stock levels.

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

model Product {
  id            String   @id @default(cuid())
  name          String
  description   String
  price         Float
  imageUrl      String
  stock         Int
  preservedStock Int @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 3. API Endpoints & Logic

This section details the logic for each API endpoint.

### `GET /api/products`

-   **Description:** Retrieves a list of all products. Supports filtering by name and sorting.
-   **Query Parameters:**
    -   `search` (string): Filter products by a search term in the name or description.
    -   `sortBy` (string): Field to sort by (e.g., `price`, `createdAt`).
    -   `order` (string): `asc` or `desc`.
-   **Logic:**
    1.  Construct a database query based on the filter and sort parameters.
    2.  If `search` is provided, use a `contains` filter on the `name` and `description` fields.
    3.  Fetch the list of products from the database.
    4.  Return a `200 OK` response with the list of products.

### `GET /api/products/:id`

-   **Description:** Retrieves a single product by its ID.
-   **Logic:**
    1.  Find the product by `id`. If not found, return a `404 Not Found` error.
    2.  Return a `200 OK` response with the product details.

### `POST /api/products`

-   **Description:** (Admin) Creates a new product.
-   **Authentication:** Requires admin privileges.
-   **Request Body:**
    ```json
    {
      "name": "New Gadget",
      "description": "The latest and greatest gadget.",
      "price": 99.99,
      "imageUrl": "https://example.com/image.png",
      "stock": 100
    }
    ```
-   **Logic:**
    1.  Validate the request body.
    2.  Create a new `Product` record in the database.
    3.  Return a `201 Created` response with the newly created product.

### `PUT /api/products/:id`

-   **Description:** (Admin) Updates an existing product.
-   **Authentication:** Requires admin privileges.
-   **Request Body:** Same as `POST /api/products`.
-   **Logic:**
    1.  Find the product by `id`. If not found, return a `404 Not Found` error.
    2.  Validate the request body.
    3.  Update the product record in the database.
    4.  Return a `200 OK` response with the updated product.

### `DELETE /api/products/:id`

-   **Description:** (Admin) Deletes a product.
-   **Authentication:** Requires admin privileges.
-   **Logic:**
    1.  Find the product by `id`. If not found, return a `404 Not Found` error.
    2.  Delete the product record from the database.
    3.  Return a `204 No Content` response.

## 4. Asynchronous Communication

-   **Event Consumption:** The Product Service will listen for the following events from the Order Service (via RabbitMQ):
    -   `OrderCreated`:
        1.  When an `OrderCreated` event is received, the message will contain the list of products and quantities in the order.
        2.  For each item, decrement the `stock` and increment the `preservedStock` in the `Product` table.
    -   `OrderPaid`:
        1.  When an `OrderPaid` event is received, the message will contain the list of products and quantities purchased.
        2.  For each item, decrement the `preservedStock` in the `Product` table.
    -   `OrderCanceled`:
        1.  When an `OrderCanceled` event is received, the message will contain the list of products and quantities from the canceled order.
        2.  For each item, increment the `stock` and decrement the `preservedStock` in the `Product` table.
