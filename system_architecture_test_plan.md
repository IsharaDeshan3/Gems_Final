# 🏗️ System Architecture & Functional Validation Plan
**Project:** Royal Gems Institute E-Commerce & Admin Platform
**Role:** Senior System Architect
**Objective:** End-to-end validation checklist to ensure full system workability, security, and production readiness.

---

## Phase 1: Environment & Infrastructure Readiness
*Before testing application logic, the underlying infrastructure must be verified.*

- [ ] **Environment Configuration:**
  - Verify all variables in `.env.local` (and Vercel production env) map correctly (Supabase URL/Keys, PayHere credentials, Site URLs).
  - Ensure `IS_SANDBOX=true` for testing and explicitly set to `false` for production.
- [ ] **Database State (Supabase):**
  - Validate all migrations have run successfully (Schemas: Users, Gems, Jewellery, Orders, Payments, Audit Logs).
  - Verify Row Level Security (RLS) policies are active and strictly enforce tenancy and role-based access.
  - Check database indexes exist for heavily queried fields (e.g., `is_active`, `category`, `user_id` on orders).
- [ ] **Storage Infrastructure:**
  - Verify Supabase Storage buckets (`gems`, `jewellery`, `avatars`) exist and have correct public/private access policies.
  - Test CORS configurations on buckets to ensure images load correctly on the frontend domain.

---

## Phase 2: Security & Authentication (Zero Trust Check)
*Validating the perimeter, session management, and access controls.*

- [ ] **Authentication Flow:**
  - Test User registration, login, and secure logout.
  - Validate password strength enforcement (Min 12 chars, upper, lower, number, special char).
  - Verify JWT session lifecycle (15m access token, 7d refresh token) and token rotation mechanism.
- [ ] **Two-Factor Authentication (2FA):**
  - Test TOTP setup via QR code (Google Authenticator).
  - Verify login is blocked until valid 2FA token is provided (if enabled).
- [ ] **Role-Based Access Control (RBAC):**
  - Test strict isolation between `User`, `Moderator`, `Admin`, and `SuperAdmin`.
  - Verify `/admin/*` routes reject unauthorized access via Next.js Middleware.
  - Verify API routes enforce role checks before database mutations.
- [ ] **Threat Mitigation:**
  - Test CSRF protection on state-mutating requests (POST, PUT, DELETE).
  - Verify Rate Limiting is active on authentication endpoints to prevent brute force.
  - Test input sanitization (XSS prevention) on all text inputs.

---

## Phase 3: Core E-Commerce User Journeys (Frontend)
*Validating the customer experience and transaction reliability.*

- [ ] **Product Catalog (Gems & Jewellery):**
  - Test data fetching, rendering, and hydration.
  - Verify pagination, sorting, and filtering logic works without performance degradation.
  - Validate that inactive (`is_active: false`) or out-of-stock items are handled correctly (hidden or marked sold out).
- [ ] **Cart & Checkout State:**
  - Test cart state management (add, remove, update quantities).
  - Verify cart persists correctly across page navigations.
  - Test boundary conditions (e.g., trying to add more items than `stock_quantity`).
- [ ] **Payment Gateway Integration (PayHere):**
  - *Sandbox Test:* Complete a successful checkout flow using PayHere test cards.
  - *Failure Handling:* Simulate payment cancellation and decline; verify cart state remains and user is notified.
  - *Webhook Validation:* Verify the system correctly processes asynchronous PayHere webhooks, verifies the `md5sig` hash, and updates the database order status to `PAID`.
- [ ] **Order Tracking:**
  - Verify users can view their order history and current status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`).

---

## Phase 4: Admin Panel & Back-Office Operations
*Validating the administrative tools and data integrity.*

- [ ] **Dashboard Analytics:**
  - Verify accuracy of KPI calculations (Total Sales, Active Orders, User Count).
- [ ] **Inventory Management (Gems & Jewellery CRUD):**
  - Test creating a new product with multiple image uploads.
  - Verify image upload security (file type validation, size limits, secure random filenames).
  - Test updating product specs, pricing, and stock levels.
  - Test soft-deletion (`is_active` toggle).
- [ ] **Order Management System:**
  - Test the order fulfillment state machine (moving orders from Paid -> Processing -> Shipped).
  - Validate refund/cancellation flows and inventory restock logic.
- [ ] **User & System Management:**
  - Test suspending/activating user accounts.
  - Test role promotion/demotion (Only SuperAdmin should do this).
- [ ] **Audit Logging:**
  - Verify that sensitive admin actions (deleting users, changing roles, updating products) generate immutable audit logs capturing Admin ID, Action, Timestamp, IP, and changes.

---

## Phase 5: Performance, UX & Error Handling
*Ensuring the system is robust under load and provides clear feedback.*

- [ ] **Next.js Rendering Optimization:**
  - Verify critical pages (Home, Collection) are statically generated (SSG) or utilize Incremental Static Regeneration (ISR) where appropriate.
  - Ensure images utilize Next.js `<Image />` component for WebP/AVIF compression and lazy loading.
- [ ] **Error Boundaries & Graceful Degradation:**
  - Trigger API timeouts and database errors to verify Next.js `error.tsx` boundaries catch and display friendly error pages.
  - Verify 404 pages (`not-found.tsx`) are working.
- [ ] **Mobile Responsiveness & Cross-Browser:**
  - Test UI on mobile breakpoints (Tailwind classes).
  - Ensure complex 3D galleries or animations gracefully fallback on lower-end devices.

---

### 📝 Next Steps for QA/Dev Team:
1. Set up a staging environment identical to production.
2. Run through this checklist methodically, assigning pass/fail to each node.
3. Log any failed checks as GitHub Issues with reproducible steps.
4. Once all checks pass in Staging, switch `IS_SANDBOX` to `false` and deploy to Production.
