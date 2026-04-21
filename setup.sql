-- ============================================================
--  HOODIES — COMPLETE SUPABASE DATABASE SETUP
--  Run this in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ── PRODUCTS ─────────────────────────────────────────────────
create table if not exists products (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  category      text not null check (category in ('hoodies','polos','tracksuits','caps','gymwear')),
  price_ngn     integer not null check (price_ngn > 0),
  description   text,
  colors        jsonb  default '[]',
  sizes         jsonb  default '[]',
  active        boolean default true,
  featured      boolean default false,
  image_url     text,       -- original worn photo
  mannequin_url text,       -- invisible mannequin image
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_featured on products(featured) where featured = true;
create index if not exists idx_products_active   on products(active)   where active   = true;

-- ── CUSTOMERS ─────────────────────────────────────────────────
create table if not exists customers (
  id          uuid primary key,   -- matches auth.users.id
  first_name  text,
  last_name   text,
  email       text unique,
  phone       text,
  created_at  timestamptz default now()
);
create index if not exists idx_customers_email on customers(email);

-- ── ORDERS ───────────────────────────────────────────────────
create table if not exists orders (
  id               uuid default gen_random_uuid() primary key,
  reference        text unique not null,
  transaction_id   text,
  customer_id      uuid references customers(id),
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text,
  customer_address text,
  items            jsonb default '[]',
  total_ngn        integer not null,
  status           text default 'paid' check (status in ('paid','processing','shipped','completed','cancelled')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists idx_orders_status     on orders(status);
create index if not exists idx_orders_created    on orders(created_at desc);
create index if not exists idx_orders_customer   on orders(customer_id);
create index if not exists idx_orders_email      on orders(customer_email);

-- ── CLOSET (saved items per user) ───────────────────────────
create table if not exists closet (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references products(id)   on delete cascade,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);
create index if not exists idx_closet_user on closet(user_id);

-- ── DESIGN REQUESTS ──────────────────────────────────────────
create table if not exists design_requests (
  id               uuid default gen_random_uuid() primary key,
  customer_name    text,
  phone            text,
  email            text,
  description      text,
  age_group        text,
  material         text,
  design_file_url  text,
  status           text default 'pending' check (status in ('pending','reviewing','quoted','completed','cancelled')),
  created_at       timestamptz default now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────

-- Products: anyone can read active products
alter table products enable row level security;
create policy "Public read active products" on products for select using (active = true);

-- Orders: anyone can create, only owner can read their own
alter table orders enable row level security;
create policy "Anyone can place order"      on orders for insert with check (true);
create policy "Customers see own orders"    on orders for select using (customer_email = auth.email());

-- Customers: users manage their own profile
alter table customers enable row level security;
create policy "Users manage own profile"    on customers for all using (id = auth.uid());

-- Closet: users manage only their own saved items
alter table closet enable row level security;
create policy "Users manage own closet"     on closet for all using (user_id = auth.uid());

-- Design requests: anyone can submit
alter table design_requests enable row level security;
create policy "Anyone can submit design"    on design_requests for insert with check (true);

-- ── STORAGE BUCKETS ──────────────────────────────────────────
-- Run these separately if needed:
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
-- insert into storage.buckets (id, name, public) values ('design-requests', 'design-requests', true);

-- ── NOTES ────────────────────────────────────────────────────
-- After running this SQL:
-- 1. Go to your admin panel → Products → Seed Default Products
-- 2. Go to Storage → create two buckets: product-images and design-requests (both Public)
-- 3. For admin to read ALL products (including inactive), temporarily disable RLS on products table
--    or add: create policy "Admin full access" on products for all using (true);
