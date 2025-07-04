# E-commerce System Functional Requirements List

## 1. Frontend User Interface (Frontend)

### Product Display
- **Product Catalog:** Provide clear categories for easy Browse of products.
- **Product Detail Page:** Include high-resolution product images, detailed descriptions, price, real-time inventory status, and user reviews and ratings.
- **Search Functionality:** A powerful and fast search engine that supports multi-dimensional filtering (e.g., price, brand) and sorting (e.g., price low to high/high to low, new arrivals, popularity).

### Shopping Cart Functionality
- Allow users to easily add, delete, and modify the quantity of products.
- Display the total price in real-time.
- Notify users that shipping fees and taxes will be updated after the merchant confirms the order.
- Support saving cart contents, even after the user logs out.

### Member Center
- **Registration/Login:** Support Discord OAuth2 login.
- **Order History:** Query the status of past orders (Awaiting merchant confirmation, Awaiting payment, Paid, Shipped, Completed, Canceled) and detailed information, including logistics tracking numbers.
- **Personal Information Management:** Allow users to manage multiple shipping addresses and edit preferences.

### Checkout Process
- **Multi-step checkout process:**
    1. Confirm shipping address.
    2. User submits the order, and the order status automatically changes to "Awaiting merchant confirmation". At this time, the product inventory is temporarily locked.
    3. Wait for the merchant to calculate and update the shipping fee in the backend.
    4. After the merchant updates the shipping fee, the system notifies the user that the order is ready for payment.
    5. The user completes the payment via the order details page by clicking a button to use Solana Pay. This is the only payment method.
- **Order Confirmation Page:** Before final payment, clearly display all order information (products, quantities, unit prices, total price, and the shipping fee to be confirmed).

## 2. Admin Portal (Frontend)

### Product Management
- Add, edit, and delete products.
- Manage product categories, brands, and custom attributes.
- Support bulk upload and update of product information.
- A mockup for the product management interface is available at [Requirement and Design/mock-ui/admin-products.html](./mock-ui/admin-products.html).

### Order Management
- View all orders, filterable by status (Pending, Awaiting merchant confirmation, Awaiting payment, Paid, Shipped, Completed, Canceled).
- **Core Functionality:** View orders with the status "Awaiting merchant confirmation", manually calculate and update the shipping fee. After updating, the order status automatically changes to "Awaiting payment".
- Modify order status.
- Enter and track logistics tracking numbers.
- Process refund/return requests (requires integration with the Solana Pay refund process or manual handling).
- A mockup for the order management interface is available at [Requirement and Design/mock-ui/admin-orders.html](./mock-ui/admin-orders.html).

### Inventory Management
- Real-time inventory quantity updates: including total stock and reserved stock.
- **Inventory Locking Logic:** When a user places an order (status is "Awaiting merchant confirmation" or "Awaiting payment"), the product quantity is deducted from "total stock" and added to "reserved stock".
- **Inventory Release Logic:**
    - After an order is successfully paid, the product quantity is deducted from "reserved stock" (as it has been actually sold).
    - After an order is canceled by the user or merchant, the product quantity is deducted from "reserved stock" and added back to "total stock".
- **No Timeout Mechanism:** Inventory locks are not automatically released due to a timeout; release depends solely on explicit changes in the order status.
- Inventory alerts (low stock reminders).
- Inbound/Outbound records.

### User Management
- Manage member accounts, including viewing and editing personal information.
- Role and permission management (currently mainly for super administrators).

### Reporting & Analytics
- Provide sales reports (revenue, top-selling products, average order value).
- Customer behavior analysis (page views, conversion rate).
- Inventory reports.

### System Settings
- Payment Settings: Configure Solana Pay related API keys, receiving wallet addresses, etc.

## 3. Third-Party Service Integrations

### Payment Gateway
- **Solana Pay:** As the sole payment method, requires deep integration of its SDK or API to implement payment request generation, transaction status monitoring, and confirmation.

### Login Authentication
- **Discord OAuth2:** Used for user registration and login.

### Logistics Service
- Logistics tracking functionality, and optional future integration to achieve automatic generation of tracking numbers and integration with courier company interfaces.

### Blockchain Services
- Integration with a blockchain service to fetch the latest on-chain data, generate payment QR codes, and query public chain information.
