# Vikas Marketing - Frontend Integration Guide

Welcome to the B2B Inventory Management Backend API. This document serves as a comprehensive guide for frontend developers (React, React Native, etc.) to successfully integrate with the backend services.

---

## 1. Project Overview

The backend is built using **Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM**. It follows a strictly typed, modular architecture utilizing centralized error handling, Zod payload validation, and JWT-based authentication.

*   **Base API URL**: `http://localhost:5000/api`
*   **Static Assets URL**: `http://localhost:5000/uploads` (for uploaded images)
*   **Authentication Flow**: Stateless JSON Web Token (JWT) Bearer authentication.

---

## 2. Authentication

All protected endpoints require an `Authorization` header containing the JWT token.

**Login API**:
`POST /api/auth/login`
Requires an `identifier` (email or phone) and a `password`.

**Authorization Header Format**:
```http
Authorization: Bearer <your_jwt_token_here>
```

---

## 3. Common API Response Structure

The API consistently returns a wrapped JSON structure. Always check the `status` key.

### Success Response (200, 201)
```json
{
  "status": "success",
  "data": { ... },
  "meta": { 
    "total": 100, 
    "page": 1, 
    "limit": 20, 
    "totalPages": 5 
  } // For paginated requests
}
```

### Error / Validation Error Response (400, 401, 403, 404, 500)
```json
{
  "status": "error",
  "message": "Detailed error message or Zod validation issue."
}
```

---

## 4. Role Permissions

The system operates on strict Role-Based Access Control (RBAC).

| Permission Set | `ADMIN` | `SALESMAN` |
| :--- | :--- | :--- |
| **Users** | Create, view, edit all users. | View own profile only. |
| **Customers** | View and create customers. | View and create customers. |
| **Products/Inventory**| Full CRUD, manage stock adjustments. | Read-only. |
| **Orders** | View all, update statuses. | View own orders, create orders. |
| **Payments** | Full CRUD, Void, Allocations. | **NO ACCESS**. |
| **Visits** | View all analytics and histories. | Manage own visits. |

---

## 5. Module Documentation

### A. Auth Module
*   `POST /auth/login` - Authenticate user.
*   `GET /auth/me` - Get current logged-in user profile.

### B. Users Module
*   `GET /users` - Get all users (Admin only).
*   `POST /users` - Create user (Admin only, accepts `multipart/form-data` for profile photo).
*   `GET /users/:id` - Get specific user.

### C. Customers Module
*   `GET /customers` - Paginated list of customers.
*   `POST /customers` - Create customer.
*   `PATCH /customers/:id` - Update customer.
*   `DELETE /customers/:id` - Soft delete customer.

### D. Products Module
*   `GET /products` - Paginated product catalog.
*   `POST /products` - Create product (Admin only, accepts `multipart/form-data` for image).
*   `GET /products/:sku` - Get product by SKU.

### E. Inventory Module (Admin Only)
*   `POST /inventory/adjust` - Manually adjust stock.
*   `GET /inventory/logs` - Audit history of stock movements.

### F. Orders Module
*   `POST /orders` - Create order. Requires a populated `items` array.
*   `GET /orders` - List orders.
*   `PATCH /orders/:id/status` - Update order status (Admin only).

**Frontend Note**: *You must have an `ACTIVE` Visit session to create an order.*

### G. Payments Module (Admin Only)
*   `POST /payments` - Create a payment and allocate funds across multiple orders.
*   `PATCH /payments/:id/void` - Void a payment and reverse financial impacts.
*   `GET /payments` - List payments.

### H. Visits Module
*   `POST /visits/checkin` - Start a visit. Requires `customer_id`.
*   `POST /visits/checkout` - End current active visit.
*   `GET /visits/active` - Get the current ongoing visit.
*   `GET /visits/analytics` - Get salesman productivity stats.

---

## 6. Enum Documentation

You will frequently encounter these strict enum values. Ensure your frontend matches these strings exactly:

*   **Role**: `ADMIN`, `SALESMAN`
*   **OrderStatus**: `PENDING`, `CONFIRMED`, `DISPATCHED`, `DELIVERED`, `CANCELLED`
*   **PaymentStatus**: `UNPAID`, `PARTIAL`, `PAID`
*   **VisitStatus**: `ACTIVE`, `COMPLETED`, `AUTO_CLOSED`
*   **PaymentMode**: `CASH`, `BANK_TRANSFER`, `UPI`, `CHEQUE`, `CARD`
*   **UnitType**: `PCS`, `KG`, `GRAM`, `BOX`, `LITER`
*   **InventoryMovementType**: `STOCK_ADDED`, `ORDER_DEDUCTED`, `MANUAL_ADJUSTMENT`, `ORDER_CANCELLED_RESTORE`

---

## 7. Pagination Documentation

Any endpoint returning lists (Customers, Products, Orders, etc.) supports query parameters:

*   `page`: The page number (default 1)
*   `limit`: Items per page (default 20)
*   `search`: Broad search query (e.g., `?search=shreeji`)
*   `sort`: `newest`, `oldest`, etc.
*   `customer_id`, `salesman_id`, `status`, etc. (for granular filtering)

---

## 8. File Upload Documentation

When uploading an image (User Profile Photo or Product Image), you cannot send a raw JSON object. You must construct a `FormData` payload.

*   **Format**: `multipart/form-data`
*   **File Field Name**: `photo` (for Users) or `image` (for Products).
*   **Supported Formats**: JPEG, PNG, WEBP (Backend heavily auto-optimizes to WEBP).
*   **Size Limit**: Configured backend-side, typically 5MB.

---

## 9. Visit Tracking Flow

Salesman productivity is tracked via Visit Sessions.

1.  **Mandatory Check-in**: A salesman MUST call `POST /visits/checkin` (providing `customer_id` and optional GPS) before the API will allow them to create an Order for that customer.
2.  **Single Active Session**: A salesman can only have ONE `ACTIVE` visit at a time. If they check-in to Customer B while active at Customer A, the backend automatically `AUTO_CLOSED`s Customer A.
3.  **Route History**: `GET /visits/route-history` reconstructs a salesman's daily path based on check-in/check-out timestamps and GPS data.

---

## 10. Order Lifecycle

*   **Stock Deduction**: Stock is mathematically deducted ONLY when an order transitions from `PENDING` to `CONFIRMED`.
*   **Editing**: An order can only have its items/pricing modified while it is in `PENDING` state.
*   **Cancellation**: Moving an order to `CANCELLED` automatically triggers an `InventoryLog` restoration, giving the stock back to the system.

---

## 11. Payment Flow

Payments manage the financial lifecycle of Orders securely.

*   **Multi-Order Allocation**: One payment of ₹10,000 can be mathematically split:
    *   ₹4,000 to Order #1
    *   ₹6,000 to Order #2
*   **Partial Payments**: Allocating less than the total Order amount automatically sets the Order's `payment_status` to `PARTIAL`. Reaching the exact amount flips it to `PAID`.
*   **Overpayments**: A payment can be recorded for ₹10,000, but only allocate ₹5,000 to orders. The remaining ₹5,000 acts as unused credit on the Payment record.
*   **Voiding**: `PATCH /payments/:id/void` instantly reverses the allocations and recalculates all affected Orders.

---

## 12. Frontend Integration Recommendations

*   **Token Storage**: Use `AsyncStorage` (React Native) or secure `localStorage` (Web) to persist the JWT token.
*   **Axios Interceptor**: Setup an Axios interceptor to automatically attach `Authorization: Bearer <token>` to every request. Also, intercept `401 Unauthorized` responses to seamlessly redirect the user to the Login screen.
*   **Enum Handling**: Map the backend string enums to TypeScript enums or Union types on the frontend for robust type safety.

---

## 13. Swagger Documentation

For an interactive UI showcasing exact endpoint payload structures, query arguments, and required fields, visit the auto-generated Swagger documentation:

👉 **[http://localhost:5000/docs](http://localhost:5000/docs)**

*(Note: The server must be running locally via `npm run dev` to view this)*

---

## 14. Example Frontend Request Flow

A typical day for a `SALESMAN` looks like this on the frontend:

1.  **Authentication**: Call `POST /auth/login`. Store the returned JWT token.
2.  **Locate Customer**: Fetch the list via `GET /customers` and select a shop.
3.  **Start Visit**: App pulls device GPS and calls `POST /visits/checkin` with the `customer_id`.
4.  **Create Order**: Salesman adds items to cart. App sends the payload to `POST /orders`. The backend validates the active visit and creates the `PENDING` order.
5.  **Finish Visit**: App pulls device GPS and calls `POST /visits/checkout`.
6.  **Payment Processing (Admin)**: Later, the Admin opens the web dashboard, views the `CONFIRMED` orders, and logs a bank transfer via `POST /payments`, instantly clearing the pending balance.
