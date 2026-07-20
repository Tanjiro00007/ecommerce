# Market & Co. — E-Commerce Store with Razorpay Integration

A full-stack e-commerce application built for the **IIMaspirant.in Backend Developer Internship Assessment**. Customers can browse and search products, manage a cart, check out, pay securely via **Razorpay**, and track their order history — all backed by a REST API with server-side payment verification, inventory control, and JWT authentication.

---

## 1. Project Overview

This project implements the full PRD scope: authentication, a searchable/filterable product catalog, a persistent shopping cart, a multi-step checkout, real payment gateway integration with signature verification, inventory management with overselling protection, and transaction/order history.

## 2. Features

- **Auth** — Register/login with hashed passwords (bcrypt) and JWT sessions.
- **Catalog** — Paginated product listing with search, category filters, price filters, and sorting (newest, price, rating).
- **Cart** — One cart per user; add/update/remove items; live subtotal, tax, delivery fee, and total.
- **Checkout** — Address → review → payment flow, with server-side re-validation of stock and prices before payment.
- **Payments** — Razorpay Checkout integration. The backend creates the gateway order and **verifies the HMAC-SHA256 signature server-side**; the frontend's reported payment status is never trusted.
- **Orders** — Order history with status tracking (Pending → Confirmed → Processing → Delivered), and per-order detail pages.
- **Inventory** — Stock is only decremented after payment is verified, using an atomic conditional update (with rollback) so the app can't oversell under concurrent checkouts.
- **Security** — Helmet, CORS allow-list, rate limiting (stricter on auth routes), Mongo query sanitization, request body size limits, centralized error handling that never leaks stack traces in production.

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Payments | Razorpay (Checkout.js + Orders API) |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend), Render/Railway (backend), MongoDB Atlas (database) |

## 4. Architecture

```
┌─────────────┐        HTTPS/JSON        ┌──────────────┐        Mongoose        ┌────────────┐
│   React     │ ───────────────────────► │   Express    │ ─────────────────────► │  MongoDB   │
│  (Vite SPA) │ ◄─────────────────────── │   REST API   │ ◄───────────────────── │   Atlas    │
└─────────────┘                          └──────┬───────┘                        └────────────┘
      │                                          │
      │  Razorpay Checkout.js (client)           │  Razorpay Orders API + signature verification
      ▼                                          ▼
┌─────────────────────────────────────────────────────────┐
│                      Razorpay Gateway                    │
└─────────────────────────────────────────────────────────┘
```

Backend layering: `routes → controllers → services → models`, with `middleware/` for auth, validation, rate limiting, and error handling, keeping business logic (payment verification, inventory, order totals) out of the controllers.

## 5. API Documentation

Base URL: `/api`. All responses follow `{ success: boolean, data?: any, message?: string }`.

### Auth
| Method | Route | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password }` |
| POST | `/auth/login` | — | `{ email, password }` |
| GET | `/auth/profile` | ✅ | — |

### Products
| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/products` | — | Query: `page, limit, sort, search, category, minPrice, maxPrice` |
| GET | `/products/:id` | — | Returns product + related products |
| POST | `/products` | ✅ | `{ title, description, price, category, stock, images[] }` |

### Cart
| Method | Route | Auth | Body |
|---|---|---|---|
| GET | `/cart` | ✅ | — |
| POST | `/cart` | ✅ | `{ productId, quantity }` |
| PATCH | `/cart` | ✅ | `{ productId, quantity }` |
| DELETE | `/cart/:id` | ✅ | `id` = productId |

### Orders
| Method | Route | Auth | Body |
|---|---|---|---|
| POST | `/orders` | ✅ | `{ address }` — snapshots the cart into a Pending order |
| GET | `/orders` | ✅ | List current user's orders |
| GET | `/orders/:id` | ✅ | Order detail |

### Payment
| Method | Route | Auth | Body |
|---|---|---|---|
| POST | `/payment/create-order` | ✅ | `{ orderId }` → creates a Razorpay order |
| POST | `/payment/verify` | ✅ | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` |

### Example error response
```json
{ "success": false, "message": "Product not found" }
```

## 6. Database Schema

**User** — `name, email (unique), password (hashed), createdAt`
**Product** — `title, description, price, category, stock, images[], rating, createdAt, updatedAt`
**Cart** — `user (unique ref), items[{ product, quantity, price }]`
**Order** — `user, items[{ product, title, quantity, price }], address{}, subtotal, tax, deliveryFee, amount, paymentStatus, orderStatus, razorpayOrderId, inventoryReduced`
**Payment** — `user, order, gatewayOrderId, paymentId, signature, amount, currency, method, status`

## 7. Installation & Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or MongoDB Atlas)
- A Razorpay account (test mode keys are free) — [dashboard.razorpay.com](https://dashboard.razorpay.com)

### Backend
```bash
cd backend
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID/SECRET
npm install
npm run seed               # optional: populates sample products
npm run dev                 # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

## 8. Environment Variables

**backend/.env**
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ecommerce
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=<your key secret>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files — only the checked-in `.env.example` templates.

## 9. Test Payment Credentials (Razorpay Test Mode)

When `RAZORPAY_KEY_ID`/`SECRET` are test-mode keys, use Razorpay's published test values at checkout:
- **Card:** 4111 1111 1111 1111, any future expiry, any CVV
- **UPI:** success@razorpay
- Full list: [Razorpay test card/UPI docs](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

## 10. Deployment

- **Frontend → Vercel:** import the `frontend/` folder, set `VITE_API_URL` to your deployed backend URL.
- **Backend → Render/Railway:** deploy the `backend/` folder, set the environment variables from step 8, and set `CLIENT_URL` to your deployed frontend URL.
- **Database → MongoDB Atlas:** create a free cluster, whitelist your backend's IP (or `0.0.0.0/0` for simplicity in an assessment context), and use the connection string as `MONGO_URI`.
- Enable HTTPS (Vercel/Render/Railway provide this by default).

_Live deployment links: add here once deployed — e.g. `Frontend: https://...`, `Backend: https://...`._

## 11. Testing Checklist

The functional checklist from the PRD (registration, login, JWT auth, product APIs, search/filter, cart CRUD, checkout, payment success/failure, signature verification, order creation, inventory update, transaction storage, order history, invalid token, invalid product, duplicate payment, empty cart, out-of-stock handling) maps directly onto the endpoints in Section 5. Recommended tools: Postman/Thunder Client for the API, and Razorpay test cards for the payment flow end-to-end.

## 12. Assumptions & Limitations

- A single **Customer** role only, per PRD scope — no admin dashboard or auth-gated admin role (the `POST /products` endpoint is protected by login only, not a role check, since roles were out of scope).
- Tax is a flat 18% and delivery fee is a flat ₹49 under ₹500 subtotal — simplified for the assessment rather than a full tax/shipping engine.
- Razorpay webhooks are not implemented; payment confirmation relies on the client-side `handler` callback calling `/payment/verify`. In production you'd add a webhook endpoint as a second, server-initiated confirmation path for resilience against the user closing the browser mid-payment.
- No automated test suite (Jest/Supertest) is included; it's listed under the PRD's optional "Future Enhancements."
- Screenshots/GIFs aren't included in this generated deliverable — add them after running the app locally or once deployed.

## 13. Future Enhancements

Per the PRD's optional list: admin dashboard, coupons/discounts, wishlist, reviews, email notifications, PDF invoices, order tracking, Razorpay webhooks, Redis caching, Docker, CI/CD, Jest/Supertest test suite, analytics dashboard.

## 14. Folder Structure

```
backend/
  controllers/   route handlers
  routes/        route definitions
  middleware/    auth, validation, rate limiting, error handling
  services/      business logic (orders, payments, inventory)
  models/        Mongoose schemas
  config/        db + Razorpay setup
  utils/         response helpers, token generation
  validators/    express-validator rule sets
  seed/          sample product seeder
frontend/
  src/components/  Navbar, ProductCard, ProtectedRoute
  src/pages/       Home, Login, Register, ProductDetails, Cart, Checkout, Orders, OrderDetails
  src/context/     AuthContext, CartContext
  src/services/    Axios API client
```
