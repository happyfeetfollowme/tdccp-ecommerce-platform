# Detailed Design: API Gateway

This document provides a detailed design for the API Gateway, which acts as the single entry point for all client requests.

## 1. Responsibilities

-   **Request Routing:** Route incoming HTTP requests to the appropriate backend microservice.
-   **Authentication:** Verify JSON Web Tokens (JWT) on protected routes and reject unauthorized requests.
-   **Rate Limiting:** Implement rate limiting to protect services from abuse and ensure availability.
-   **Request/Response Transformation:** Modify requests and responses as needed (e.g., adding headers).
-   **Centralized Logging:** Act as a central point for logging all incoming requests and outgoing responses.
-   **CORS:** Handle Cross-Origin Resource Sharing (CORS) pre-flight requests.

## 2. Technology Choice

-   **Framework:** Node.js with `express-http-proxy` or a dedicated gateway solution like Express Gateway or NestJS.
-   **Justification:** A Node.js-based solution is lightweight, fast, and aligns with the existing backend technology stack. `express-http-proxy` is a simple and effective library for routing requests to other services.

## 3. Routing Logic

The API Gateway will maintain a routing table that maps incoming request paths to the correct downstream service. The gateway will resolve the location of each microservice through environment variables or a service discovery mechanism.

| Incoming Path Prefix | Target Service      | Internal URL                       |
| -------------------- | ------------------- | ---------------------------------- |
| `/api/auth`          | User Service        | `http://user-service:PORT/api/auth`      |
| `/api/users`         | User Service        | `http://user-service:PORT/api/users`     |
| `/api/products`      | Product Service     | `http://product-service:PORT/api/products` |
| `/api/cart`          | Order Service       | `http://order-service:PORT/api/cart`     |
| `/api/orders`        | Order Service       | `http://order-service:PORT/api/orders`   |
| `/api/admin/orders`  | Order Service       | `http://order-service:PORT/api/admin/orders` |
| `/api/payments`      | Payment Service     | `http://payment-service:PORT/api/payments` |

## 4. Authentication Workflow

1.  The API Gateway will inspect the `Authorization` header for a JWT on all incoming requests, except for public routes (e.g., `GET /api/products`).
2.  If a token is present, the gateway will validate its signature and expiration.
3.  If the token is valid, the gateway will decode the payload (containing the `userId`) and pass it to the downstream service in a custom header (e.g., `X-User-Id`).
4.  If the token is invalid or missing for a protected route, the gateway will immediately reject the request with a `401 Unauthorized` error, preventing it from ever reaching a backend service.

This approach centralizes authentication logic, simplifying the microservices, which can trust that any request they receive has already been authenticated.

## 5. Error Handling and Logging

-   **Error Handling:** If a downstream service is unavailable or returns a `5xx` error, the API Gateway will return a generic `503 Service Unavailable` or `502 Bad Gateway` error to the client. This prevents leaking internal error details.
-   **Logging:** The gateway will log key information for every request, including:
    -   Timestamp
    -   Request Method & Path
    -   Status Code
    -   Response Time
    -   User-Agent
    -   `X-User-Id` (for authenticated requests)

This centralized logging is invaluable for monitoring and debugging the entire system.

## 6. Rate Limiting

A middleware like `express-rate-limit` will be used to implement a basic rate-limiting strategy. This will be configured to limit the number of requests per IP address over a given time window to prevent brute-force attacks and denial-of-service.
