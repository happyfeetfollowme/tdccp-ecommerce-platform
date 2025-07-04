# Product Requirements Document: E-commerce Platform

## 1. Introduction

This document outlines the product requirements for a new e-commerce platform. The platform will enable users to browse products, make purchases, and manage their accounts. The backend will provide administrators with tools to manage products, orders, and users. A key feature of this platform will be the integration of Solana Pay as the primary payment method.

## 2. User Roles

* **User:** A customer who can browse the site, purchase products, and manage their account.
* **Admin:** A site administrator who can manage products, orders, users, and site settings.

## 3. Functional Requirements

### 3.1. Frontend (User-Facing)

#### 3.1.1. Product Discovery
* **Product Listing Page:**
    * Display a grid or list of all available products.
    * Each product should show an image, name, and price.
    * Implement search functionality to find products by name.
    * Implement filtering options based on:
        * Price (low to high, high to low)
        * Category
        * Newest arrivals
        * Popularity
* **Product Detail Page:**
    * Display detailed information for a single product, including:
        * Multiple product images
        * Product name and a detailed description
        * Price
        * User reviews and ratings
        * "Add to Cart" button

#### 3.1.2. Shopping Cart & Checkout
* **Shopping Cart:**
    * Users can add products to their shopping cart.
    * The cart should be visible from all pages.
    * Users can view their cart to see all added items, quantities, and the total price.
    * Users can update item quantities or remove items from the cart.
    * The total price should update in real-time as the cart is modified.
* **Checkout Process:**
    1.  **Shipping Information:** The user provides their shipping address.
    2.  **Order Review & Confirmation:** The user reviews their order details. The system groups items by their associated wallet address. Upon confirmation, one or more orders are placed (one for each unique wallet address), and their status is set to "Processing".
    3.  **Inventory Update:** The system deducts the purchased items from the available inventory.
    4.  **Payment Notification:** The user is notified that the order(s) are ready for payment, and the order status is updated to "Waiting for Payment".
    5.  **Payment:** The user is directed to a payment page to complete the purchase for each order using Solana Pay.
* **Order Confirmation:**
    * After a successful payment, an order confirmation page is displayed, summarizing the details of all created orders.

#### 3.1.3. User Account
* **Authentication:**
    * Users can register and log in using their Discord account (OAuth2).
* **Account Management:**
    * **Order History:** Users can view a list of their past and current orders, including order status and details. Users can cancel orders that are in "Processing" or "Waiting for Payment" status.
    * **Personal Information:** Users can manage their personal information, including their shipping addresses.

### 3.2. Admin Portal

#### 3.2.1. Product Management
* Admins can perform CRUD (Create, Read, Update, Delete) operations on products.
* Admins can manage all product details, including name, description, price, and inventory levels.
* Admins can upload and manage product images.
* A mockup for the product management interface is available at [Requirement and Design/mock-ui/admin-products.html](./mock-ui/admin-products.html).

#### 3.2.2. Order Management
* Admins can view a list of all orders with their current status (e.g., Processing, Waiting for Payment, Paid, Shipped, Delivered, Canceled).
* Admins can modify order details, including the total price, shipping fee, and update the order's status.
* Admins can generate and manage invoices for orders.
* Admins can process payments and refunds. Payments will be handled via Solana Pay, while refunds will be processed manually.
* A mockup for the order management interface is available at [Requirement and Design/mock-ui/admin-orders.html](./mock-ui/admin-orders.html).

#### 3.2.3. Inventory Management
* Inventory levels are automatically updated when an order is paid for or canceled.
* When an order is successfully paid for, the inventory for the purchased items is deducted.
* When an order is canceled, the inventory for the items in that order is restored.
* The system should provide low-stock alerts to admins.
* Admins can generate and export inventory reports.
* Admins can import and export inventory data.

#### 3.2.4. User Management
* Admins can log in to the admin panel.
* Admins can view and manage all user accounts.
* Implement Role-Based Access Control (RBAC) to define different levels of admin permissions (e.g., Super Admin, Order Manager).

#### 3.2.5. Analytics and Reporting
* The admin panel will feature a dashboard displaying key metrics, such as:
    * Daily revenue
    * Top-selling products
    * User growth
* Admins can generate sales reports, filterable by date range.
* Admins can generate inventory reports.

#### 3.2.6. System Settings
* Admins can configure the Solana Pay integration, including API keys and wallet addresses.

## 4. Third-Party Integrations

* **Payment Gateway:**
    * **Solana Pay:** This will be the exclusive payment method. The platform will integrate with the Solana Pay SDK or API to:
        * Generate payment requests.
        * Verify transaction statuses.
        * Confirm successful payments.
* **Authentication:**
    * **Discord OAuth2:** To be used for user registration and login.
* **Blockchain Services:**
    * The platform will integrate with a blockchain service to fetch the latest on-chain data, generate payment QR codes, and query public chain information.

## 5. Non-Functional Requirements

* **Security:** All user data must be stored securely. Sensitive information, such as passwords, should be hashed.
* **Performance:** The website should load quickly, and all backend processes should be optimized for speed.
* **Scalability:** The platform should be designed to handle a growing number of users, products, and orders.
* **Usability:** Both the user-facing website and the admin panel should be intuitive and easy to use.
