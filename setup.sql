alter table products add column if not exists image_url     text;
alter table products add column if not exists mannequin_url text;
alter table products add column if not exists updated_at    timestamptz default now();
alter table orders   add column if not exists updated_at    timestamptz default now();

drop policy if exists "Public read active products"  on products;
drop policy if exists "Anyone can read products"     on products;
drop policy if exists "Anyone can insert products"   on products;
drop policy if exists "Anyone can update products"   on products;
drop policy if exists "Anyone can delete products"   on products;
drop policy if exists "products_select"              on products;
drop policy if exists "products_insert"              on products;
drop policy if exists "products_update"              on products;
drop policy if exists "products_delete"              on products;
drop policy if exists "Anyone can place order"       on orders;
drop policy if exists "Anyone can read orders"       on orders;
drop policy if exists "Anyone can update orders"     on orders;
drop policy if exists "Customers see own orders"     on orders;
drop policy if exists "orders_select"                on orders;
drop policy if exists "orders_insert"                on orders;
drop policy if exists "orders_update"                on orders;
drop policy if exists "Users manage own profile"     on customers;
drop policy if exists "customers_select"             on customers;
drop policy if exists "customers_insert"             on customers;
drop policy if exists "customers_update"             on customers;
drop policy if exists "Users manage own closet"      on closet;
drop policy if exists "closet_select"                on closet;
drop policy if exists "closet_insert"                on closet;
drop policy if exists "closet_delete"                on closet;
drop policy if exists "Anyone can submit design"     on design_requests;
drop policy if exists "Anyone can read design requests" on design_requests;
drop policy if exists "design_select"                on design_requests;
drop policy if exists "design_insert"                on design_requests;
drop policy if exists "design_update"                on design_requests;

alter table products        enable row level security;
alter table orders          enable row level security;
alter table customers       enable row level security;
alter table closet          enable row level security;
alter table design_requests enable row level security;

create policy "products_select" on products for select using (true);
create policy "products_insert" on products for insert with check (true);
create policy "products_update" on products for update using (true);
create policy "products_delete" on products for delete using (true);
create policy "orders_select"   on orders for select using (true);
create policy "orders_insert"   on orders for insert with check (true);
create policy "orders_update"   on orders for update using (true);
create policy "customers_select" on customers for select using (true);
create policy "customers_insert" on customers for insert with check (true);
create policy "customers_update" on customers for update using (true);
create policy "closet_select"   on closet for select using (true);
create policy "closet_insert"   on closet for insert with check (true);
create policy "closet_delete"   on closet for delete using (true);
create policy "design_select"   on design_requests for select using (true);
create policy "design_insert"   on design_requests for insert with check (true);
create policy "design_update"   on design_requests for update using (true);

select column_name from information_schema.columns
where table_name = 'products' and table_schema = 'public'
order by ordinal_position;
