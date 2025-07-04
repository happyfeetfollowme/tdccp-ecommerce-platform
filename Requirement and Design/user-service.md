# Detailed Design: User Service

This document provides a detailed design for the User Service, which is responsible for user authentication, registration, and profile management.

## 1. Responsibilities

-   User registration (Discord OAuth only).
-   User authentication and session management (JWT).
-   User profile management.
-   Securely storing and managing user credentials and roles.

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

enum Role {
  USER
  ADMIN
}

model User {
  id           String  @id @default(cuid())
  email        String  @unique
  discordId    String  @unique
  role         Role    @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## 3. API Endpoints & Logic

This section details the logic for each API endpoint.

### `GET /api/auth/discord`

-   **Description:** Initiates the Discord OAuth2 flow.
-   **Logic:**
    1.  Redirect the user to the Discord authorization URL (`https://discord.com/api/oauth2/authorize`).
    2.  Include the `client_id`, `redirect_uri`, `response_type=code`, and necessary `scope` (e.g., `identify`, `email`) as query parameters.

### `GET /api/auth/discord/callback`

-   **Description:** Handles the callback from Discord after user authorization.
-   **Logic:**
    1.  Receive the `code` from the query parameters.
    2.  Exchange the `code` for an access token by making a `POST` request to Discord's token URL.
    3.  Use the access token to fetch the user's profile (including Discord ID and email) from the Discord API.
    4.  Check if a user with this `discordId` already exists.
    5.  **If user exists:** Log them in by generating and returning a JWT.
    6.  **If user does not exist:** Create a new `User` record with their Discord ID, email, and a default `role` of `USER`. Generate and return a JWT.

### `POST /api/auth/logout`

-   **Description:** Logs out a user.
-   **Logic:**
    1.  This is a client-side operation. The client should discard the JWT.
    2.  For enhanced security, a server-side JWT blocklist (e.g., using Redis) can be implemented. The JWT ID (`jti`) would be added to the blocklist upon logout.

### `GET /api/users/me`

-   **Description:** Retrieves the profile of the currently authenticated user.
-   **Authentication:** Requires a valid JWT.
-   **Logic:**
    1.  Extract the `userId` from the JWT payload.
    2.  Fetch the user from the database using the `userId`.
    3.  Return the user object, including their `role`.

### `PUT /api/users/me`

-   **Description:** Updates the profile of the currently authenticated user.
-   **Authentication:** Requires a valid JWT.
-   **Request Body:**
    ```json
    {
      "email": "new-email@example.com"
    }
    ```
-   **Logic:**
    1.  Extract the `userId` from the JWT payload.
    2.  Validate the request body.
    3.  Update the user's information in the database.
    4.  Return the updated user object.

### `PUT /api/users/:id/role`

-   **Description:** Updates the role of a specific user. This is an admin-only endpoint.
-   **Authentication:** Requires a valid JWT from a user with the `ADMIN` role.
-   **Request Body:**
    ```json
    {
      "role": "ADMIN"
    }
    ```
-   **Logic:**
    1.  Verify the JWT and check if the authenticated user has the `ADMIN` role.
    2.  Extract the `userId` from the URL parameters.
    3.  Validate the request body to ensure the role is a valid `Role` enum value.
    4.  Update the user's role in the database.
    5.  Return the updated user object.