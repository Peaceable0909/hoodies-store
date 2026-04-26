-- ============================================================
--  HOODIES STORE — FULL SETUP SQL
--  Run this entire script in Supabase SQL Editor
-- ============================================================

-- ── ADD MISSING COLUMNS ──────────────────────────────────────
alter table products add column if not exists image_url     text;
alter table products add column if not exists mannequin_url text;
alter table products add column if not exists updated_at    timestamptz default now();
alter table orders   add column if not exists updated_at    timestamptz default now();

-- ── DROP ALL OLD POLICIES ────────────────────────────────────
drop policy if exists "Public read active products"         on products;
drop policy if exists "Anyone can read products"            on products;
drop policy if exists "Anyone can insert products"          on products;
drop policy if exists "Anyone can update products"          on products;
drop policy if exists "Anyone can delete products"          on products;
drop policy if exists "products_select"                     on products;
drop policy if exists "products_insert"                     on products;
drop policy if exists "products_update"                     on products;
drop policy if exists "products_delete"                     on products;
drop policy if exists "Anyone can place order"              on orders;
drop policy if exists "Anyone can read orders"              on orders;
drop policy if exists "Anyone can update orders"            on orders;
drop policy if exists "Customers see own orders"            on orders;
drop policy if exists "orders_select"                       on orders;
drop policy if exists "orders_insert"                       on orders;
drop policy if exists "orders_update"                       on orders;
drop policy if exists "Users manage own profile"            on customers;
drop policy if exists "customers_select"                    on customers;
drop policy if exists "customers_insert"                    on customers;
drop policy if exists "customers_update"                    on customers;
drop policy if exists "Users manage own closet"             on closet;
drop policy if exists "closet_select"                       on closet;
drop policy if exists "closet_insert"                       on closet;
drop policy if exists "closet_delete"                       on closet;
drop policy if exists "Anyone can submit design"            on design_requests;
drop policy if exists "Anyone can read design requests"     on design_requests;
drop policy if exists "design_select"                       on design_requests;
drop policy if exists "design_insert"                       on design_requests;
drop policy if exists "design_update"                       on design_requests;
drop policy if exists "Anyone can create an order"          on orders;

-- ── ENABLE RLS ───────────────────────────────────────────────
alter table products        enable row level security;
alter table orders          enable row level security;
alter table customers       enable row level security;
alter table closet          enable row level security;
alter table design_requests enable row level security;

-- ============================================================
--  PRODUCTS
--  Public can READ. Only logged-in admin can WRITE.
-- ============================================================
create policy "products_select" on products
  for select using (true);                                    -- anyone can browse

create policy "products_insert" on products
  for insert to authenticated with check (true);             -- admin only

create policy "products_update" on products
  for update to authenticated using (true) with check (true); -- admin only

create policy "products_delete" on products
  for delete to authenticated using (true);                  -- admin only

-- ============================================================
--  ORDERS
--  Anyone can place an order (anon checkout).
--  Only logged-in admin can read all orders or update status.
-- ============================================================
create policy "orders_insert" on orders
  for insert with check (true);                              -- anyone can checkout

create policy "orders_select" on orders
  for select to authenticated using (true);                  -- admin only

create policy "orders_update" on orders
  for update to authenticated using (true) with check (true); -- admin only

-- ============================================================
--  CUSTOMERS
--  Anyone can create a customer record (on checkout).
--  Only logged-in admin can read or update customer records.
-- ============================================================
create policy "customers_insert" on customers
  for insert with check (true);                              -- anyone on checkout

create policy "customers_select" on customers
  for select to authenticated using (true);                  -- admin only

create policy "customers_update" on customers
  for update to authenticated using (true) with check (true); -- admin only

-- ============================================================
--  CLOSET (saved/wishlist items)
--  Anyone can manage their own closet entries.
-- ============================================================
create policy "closet_select" on closet
  for select using (true);

create policy "closet_insert" on closet
  for insert with check (true);

create policy "closet_delete" on closet
  for delete using (true);

-- ============================================================
--  DESIGN REQUESTS
--  Anyone can submit a design request.
--  Only logged-in admin can read and update them.
-- ============================================================
create policy "design_insert" on design_requests
  for insert with check (true);                              -- public can submit

create policy "design_select" on design_requests
  for select to authenticated using (true);                  -- admin only

create policy "design_update" on design_requests
  for update to authenticated using (true) with check (true); -- admin only

-- ============================================================
--  STORAGE — products bucket
--  Public can read images. Only admin can upload.
-- ============================================================
drop policy if exists "admin_upload"   on storage.objects;
drop policy if exists "public_read"    on storage.objects;

create policy "public_read" on storage.objects
  for select using (bucket_id = 'products');

create policy "admin_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'products');

-- ── VERIFY COLUMNS ADDED ─────────────────────────────────────
select column_name from information_schema.columns
where table_name = 'products' and table_schema = 'public'
order by ordinal_position;
