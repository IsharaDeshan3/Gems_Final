# Royal Gems Institute - Database Schema

This document describes the complete database schema for the Royal Gems Institute e-commerce platform.

## Overview

The database uses PostgreSQL (Supabase) with the following core tables:
- **users** - User accounts and authentication
- **gems** - Gemstone products
- **jewellery** - Jewellery products with certification
- **orders** - Customer orders
- **order_items** - Line items for orders
- **payments** - PayHere payment transactions
- **payment_webhook_logs** - Payment gateway webhooks
- **audit_logs** - System activity audit trail

## Entity Relationship Diagram

```
users (1) ──< (N) orders
users (1) ──< (N) payments
users (1) ──< (N) audit_logs

orders (1) ──< (N) order_items
orders (1) ── (1) payments

gems (1) ──< (N) order_items
jewellery (1) ──< (N) order_items (future support)

payments (1) ──< (N) payment_webhook_logs
```

## Table Schemas

### users

User accounts with authentication and role-based access control.

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  role text NOT NULL DEFAULT 'user' 
    CHECK (role IN ('superadmin', 'admin', 'moderator', 'user')),
  is_active boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT false,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  two_factor_secret text,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_role_idx ON users (role);
CREATE INDEX users_is_active_idx ON users (is_active);
```

**Roles:**
- `superadmin` - Full system access
- `admin` - Administrative access
- `moderator` - Content moderation
- `user` - Standard customer

### gems

Gemstone products with geological specifications.

```sql
CREATE TABLE gems (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL DEFAULT 'Other',
  
  -- Gemological fields
  carat_weight numeric(5,2),
  color text,
  clarity text,
  cut text,
  origin text,
  certification text,
  identification text,
  weight_carats text,
  shape_and_cut text,
  dimensions text,
  treatments text,
  
  images text[],
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX gems_category_idx ON gems (category);
CREATE INDEX gems_origin_idx ON gems (origin);
CREATE INDEX gems_is_active_idx ON gems (is_active);
CREATE INDEX gems_created_at_idx ON gems (created_at);
```

### jewellery

Certified jewellery products with metal and gemstone specifications.

```sql
CREATE TABLE jewellery (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  
  -- Jewellery specifications
  metal_type_purity text,
  gross_weight_grams numeric(10,3),
  gemstone_type text,
  carat_weight numeric(10,2),
  cut_and_shape text,
  color_and_clarity text,
  
  -- Certification
  report_number text,
  report_date date,
  authorized_seal_signature text,
  
  images text[],
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX jewellery_is_active_idx ON jewellery (is_active);
CREATE INDEX jewellery_created_at_idx ON jewellery (created_at);
CREATE INDEX jewellery_metal_type_idx ON jewellery (metal_type_purity);
CREATE INDEX jewellery_gemstone_type_idx ON jewellery (gemstone_type);
```

### orders

Customer orders with shipping and payment tracking.

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address jsonb,
  billing_address jsonb,
  payment_method text,
  payment_status text DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  tracking_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX orders_user_id_idx ON orders (user_id);
CREATE INDEX orders_status_idx ON orders (status);
CREATE INDEX orders_payment_status_idx ON orders (payment_status);
CREATE INDEX orders_created_at_idx ON orders (created_at);
```

**Order Status Flow:**
1. `pending` - Order created, awaiting payment
2. `confirmed` - Payment received
3. `processing` - Being prepared for shipment
4. `shipped` - Dispatched to customer
5. `delivered` - Successfully delivered
6. `cancelled` - Order cancelled

### order_items

Line items for orders (products in cart).

```sql
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  gem_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (gem_id) REFERENCES gems(id) ON DELETE CASCADE
);

CREATE INDEX order_items_order_id_idx ON order_items (order_id);
CREATE INDEX order_items_gem_id_idx ON order_items (gem_id);
```

**Note:** Currently supports `gem_id` only. Future enhancement: support both `gem_id` and `jewellery_id` with a `product_type` discriminator.

### payments

PayHere payment transactions.

```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  user_id uuid,
  
  -- Payment details
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'LKR',
  payment_method text,
  
  -- PayHere specific
  payhere_order_id text,
  payhere_payment_id text,
  merchant_id text,
  status_code text,
  md5sig text,
  
  -- Status tracking
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  
  -- Customer details
  customer_email text,
  customer_phone text,
  customer_name text,
  
  -- Additional data
  items jsonb,
  billing_details jsonb,
  metadata jsonb,
  payhere_response jsonb,
  error_message text,
  
  -- Timestamps
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  completed_at timestamptz,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX payments_user_id_idx ON payments (user_id);
CREATE INDEX payments_order_id_idx ON payments (order_id);
CREATE INDEX payments_status_idx ON payments (status);
CREATE INDEX payments_payhere_payment_id_idx ON payments (payhere_payment_id);
CREATE INDEX payments_created_at_idx ON payments (created_at DESC);
```

### payment_webhook_logs

Audit trail for PayHere webhook callbacks.

```sql
CREATE TABLE payment_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid,
  order_id text,
  
  -- Webhook details
  event_type text,
  status text,
  
  -- Raw data
  payload jsonb NOT NULL,
  headers jsonb,
  
  -- Verification
  signature_valid boolean,
  processing_status text DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processed', 'failed', 'ignored')),
  error_message text,
  
  -- Request metadata
  ip_address text,
  user_agent text,
  
  -- Timestamps
  created_at timestamptz DEFAULT NOW(),
  processed_at timestamptz,
  
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

CREATE INDEX webhook_logs_payment_id_idx ON payment_webhook_logs (payment_id);
CREATE INDEX webhook_logs_order_id_idx ON payment_webhook_logs (order_id);
CREATE INDEX webhook_logs_created_at_idx ON payment_webhook_logs (created_at DESC);
CREATE INDEX webhook_logs_processing_status_idx ON payment_webhook_logs (processing_status);
```

### audit_logs

System activity audit trail for compliance and debugging.

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX audit_logs_user_id_idx ON audit_logs (user_id);
CREATE INDEX audit_logs_entity_type_idx ON audit_logs (entity_type);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at DESC);
CREATE INDEX audit_logs_action_idx ON audit_logs (action);
```

**Common Actions:**
- `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`
- `CREATE_GEM`, `UPDATE_GEM`, `DELETE_GEM`
- `CREATE_JEWELLERY`, `UPDATE_JEWELLERY`, `DELETE_JEWELLERY`
- `CREATE_ORDER`, `UPDATE_ORDER`, `CANCEL_ORDER`
- `LOGIN`, `LOGOUT`, `LOGIN_FAILED`

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### users
- Users can view/update their own profile
- Admins can view/update all users

### gems & jewellery
- Anyone can view active products
- Admins can manage all products

### orders & order_items
- Users can view/create/update their own pending orders
- Admins can view/update all orders

### payments & payment_webhook_logs
- Users can view their own payments
- Admins can view all payments and logs
- Service role has full access for API routes

### audit_logs
- Admins can view all logs
- Regular users cannot access

## Triggers

### Auto-update timestamps

All tables with `updated_at` have a trigger:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_{table}_updated_at
  BEFORE UPDATE ON {table}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Migration Files

Migrations are located in `supabase/migrations/`:

1. `supabase-schema.sql` - Base schema (users, gems, orders, order_items, audit_logs)
2. `004_create_payments_table.sql` - Payment tables
3. `005_storage_policies.sql` - Storage bucket policies
4. `006_gems_new_spec_fields.sql` - Additional gem specification fields
5. `007_create_jewellery_table.sql` - Jewellery table

## Data Types

- `uuid` - Universally unique identifiers (primary keys)
- `text` - Variable-length strings
- `numeric(10,2)` - Decimal numbers (price, amounts)
- `integer` - Whole numbers (quantities, counts)
- `boolean` - True/false flags
- `timestamptz` - Timestamps with timezone (UTC)
- `jsonb` - JSON binary format (structured data)
- `text[]` - Array of text (images, tags)
- `date` - Date only (no time)

## Best Practices

1. **Always use UTC timestamps** - All dates stored in UTC
2. **Soft deletes** - Set `is_active = false` instead of deleting
3. **Audit trail** - Log all admin actions in `audit_logs`
4. **Price precision** - Use `numeric(10,2)` for monetary values
5. **Foreign keys** - Enforce referential integrity
6. **Indexes** - Add indexes on frequently queried fields
7. **Constraints** - Use CHECK constraints for data validation
8. **RLS** - Enable Row Level Security for all tables

## Future Enhancements

1. **Product polymorphism** - Unify gems and jewellery into a single products table with type discriminator
2. **Inventory tracking** - Add warehouse locations and stock movement logs
3. **Customer reviews** - Reviews and ratings table
4. **Wishlist** - Customer saved items
5. **Promotions** - Discount codes and promotional campaigns
6. **Shipping** - Shipping methods, carriers, and tracking integration
7. **Returns** - Return requests and refund management
