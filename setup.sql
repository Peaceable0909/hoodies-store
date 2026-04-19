-- ============================================================
--  HOODIES KINETIC ATELIER — SUPABASE DATABASE SETUP
--  Run this ONCE in Supabase → SQL Editor → New Query
-- ============================================================

-- PRODUCTS TABLE
create table if not exists products (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  category    text not null check (category in ('hoodies','polos','tracksuits','caps')),
  price_ngn   integer not null,
  emoji       text default '🧥',
  description text,
  colors      jsonb default '[]',
  sizes       jsonb default '[]',
  active      boolean default true,
  featured    boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ORDERS TABLE
create table if not exists orders (
  id               uuid default gen_random_uuid() primary key,
  reference        text unique not null,
  transaction_id   text,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text,
  customer_address text,
  items            jsonb default '[]',
  total_ngn        integer not null,
  currency_charged text default 'NGN',
  status           text default 'paid' check (status in ('paid','processing','shipped','cancelled')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ROW LEVEL SECURITY
-- Products: anyone can read active products, only service_role can write
alter table products enable row level security;
create policy "Public can read active products"
  on products for select
  using (active = true);

-- Orders: only service_role reads/writes (admin), but anon can INSERT (for checkout)
alter table orders enable row level security;
create policy "Anyone can create an order"
  on orders for insert
  with check (true);

-- INDEX for faster queries
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_featured on products(featured);

-- Allow admin dashboard to read all products (including inactive)
-- In Supabase dashboard: Settings → API → disable RLS for products temporarily
-- OR create a separate admin policy with a secret header check.

-- ============================================================
--  IMPORTANT NEXT STEPS AFTER RUNNING THIS:
--
--  1. Go to Supabase → Table Editor → products
--  2. Go to your admin panel: yoursite.com/admin/login.html
--  3. Login with password: Peaceable@Son
--  4. Click "Seed Default Products" to add your product catalog
--  5. Start taking orders!
-- ============================================================
