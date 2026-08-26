-- DIY marketplace: collector-made e-waste upcycles sold to residents.
-- Admin reviews listings. GCash/cash are recorded in-app (no payment gateway).

create or replace function public.is_resident()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'resident' from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_resident() from public;
grant execute on function public.is_resident() to authenticated;

create type public.diy_product_status as enum (
  'draft',
  'pending_review',
  'active',
  'hidden',
  'rejected'
);

create type public.diy_order_status as enum (
  'pending_payment',
  'paid',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
  'rejected'
);

create table public.diy_products (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null
    check (category in (
      'home_decor',
      'lighting',
      'accessories',
      'storage',
      'furniture',
      'gadgets',
      'other'
    )),
  ewaste_source text not null default '',
  price numeric(12, 2) not null check (price > 0),
  stock integer not null default 1 check (stock >= 0),
  status public.diy_product_status not null default 'draft',
  rejection_reason text,
  collector_name text not null default '',
  collector_phone text,
  collector_address text,
  collector_gcash_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diy_products_collector_id_idx on public.diy_products (collector_id);
create index diy_products_status_idx on public.diy_products (status);

create table public.diy_product_photos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.diy_products (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index diy_product_photos_product_id_idx on public.diy_product_photos (product_id);

create table public.diy_cart_items (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.diy_products (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resident_id, product_id)
);

create index diy_cart_items_resident_id_idx on public.diy_cart_items (resident_id);

create table public.diy_orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.diy_products (id),
  collector_id uuid not null references public.profiles (id),
  resident_id uuid not null references public.profiles (id),
  title text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  total_amount numeric(12, 2) not null,
  payment_method public.payout_method not null,
  collector_gcash_number text,
  fulfillment_method text not null
    check (fulfillment_method in ('pickup', 'delivery')),
  collector_name text not null default '',
  collector_phone text,
  collector_address text,
  resident_name text not null default '',
  resident_phone text,
  delivery_address text,
  notes text,
  status public.diy_order_status not null default 'pending_payment',
  rejection_reason text,
  paid_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diy_orders_resident_id_idx on public.diy_orders (resident_id);
create index diy_orders_collector_id_idx on public.diy_orders (collector_id);
create index diy_orders_status_idx on public.diy_orders (status);

create trigger diy_products_set_updated_at
  before update on public.diy_products
  for each row
  execute function public.set_updated_at();

create trigger diy_cart_items_set_updated_at
  before update on public.diy_cart_items
  for each row
  execute function public.set_updated_at();

create trigger diy_orders_set_updated_at
  before update on public.diy_orders
  for each row
  execute function public.set_updated_at();

create or replace function public.diy_fill_collector_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  collector public.profiles;
begin
  select * into collector from public.profiles where id = new.collector_id;
  if collector.id is null then
    raise exception 'Collector profile not found';
  end if;
  new.collector_name := coalesce(collector.full_name, '');
  new.collector_phone := collector.phone;
  new.collector_address := collector.address;
  new.collector_gcash_number := collector.default_gcash_number;
  return new;
end;
$$;

create trigger diy_products_fill_collector_snapshot
  before insert or update of collector_id on public.diy_products
  for each row
  execute function public.diy_fill_collector_snapshot();

create or replace function public.diy_sync_products_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'collector' then
    update public.diy_products
    set
      collector_name = coalesce(new.full_name, ''),
      collector_phone = new.phone,
      collector_address = new.address,
      collector_gcash_number = new.default_gcash_number
    where collector_id = new.id;
  end if;
  return new;
end;
$$;

create trigger profiles_sync_diy_products
  after update of full_name, phone, address, default_gcash_number on public.profiles
  for each row
  execute function public.diy_sync_products_from_profile();

create or replace function public.diy_guard_product_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'New products must start as drafts';
    end if;
    if new.collector_id <> auth.uid() then
      raise exception 'You can only create your own products';
    end if;
    return new;
  end if;

  if new.collector_id is distinct from old.collector_id then
    raise exception 'Cannot transfer a product';
  end if;

  if old.status is not distinct from new.status then
    return new;
  end if;

  if public.is_collector() and new.collector_id = auth.uid() then
    if old.status = 'draft' and new.status = 'pending_review' then
      return new;
    elsif old.status = 'pending_review' and new.status = 'draft' then
      return new;
    elsif old.status = 'active' and new.status = 'hidden' then
      return new;
    elsif old.status in ('rejected', 'hidden') and new.status in ('draft', 'pending_review') then
      return new;
    end if;
  end if;

  raise exception 'Invalid product status change';
end;
$$;

create trigger diy_products_guard_status
  before insert or update on public.diy_products
  for each row
  execute function public.diy_guard_product_status();

-- RLS
alter table public.diy_products enable row level security;
alter table public.diy_product_photos enable row level security;
alter table public.diy_cart_items enable row level security;
alter table public.diy_orders enable row level security;

create policy "Authenticated can read active diy products"
  on public.diy_products
  for select
  to authenticated
  using (
    status = 'active'
    or collector_id = auth.uid()
    or public.is_admin()
  );

create policy "Collectors can insert own diy products"
  on public.diy_products
  for insert
  to authenticated
  with check (
    public.is_collector()
    and collector_id = auth.uid()
    and status = 'draft'
  );

create policy "Collectors can update own diy products"
  on public.diy_products
  for update
  to authenticated
  using (public.is_collector() and collector_id = auth.uid())
  with check (public.is_collector() and collector_id = auth.uid());

create policy "Collectors can delete own draft diy products"
  on public.diy_products
  for delete
  to authenticated
  using (
    public.is_collector()
    and collector_id = auth.uid()
    and status = 'draft'
  );

create policy "Admins can update diy products"
  on public.diy_products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Can read diy photos of visible products"
  on public.diy_product_photos
  for select
  to authenticated
  using (
    exists (
      select 1 from public.diy_products p
      where p.id = product_id
        and (
          p.status = 'active'
          or p.collector_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "Collectors can insert own diy photos"
  on public.diy_product_photos
  for insert
  to authenticated
  with check (
    public.is_collector()
    and exists (
      select 1 from public.diy_products p
      where p.id = product_id and p.collector_id = auth.uid()
    )
  );

create policy "Collectors can delete own diy photos"
  on public.diy_product_photos
  for delete
  to authenticated
  using (
    public.is_collector()
    and exists (
      select 1 from public.diy_products p
      where p.id = product_id and p.collector_id = auth.uid()
    )
  );

create policy "Residents can read own diy cart"
  on public.diy_cart_items
  for select
  to authenticated
  using (public.is_resident() and resident_id = auth.uid());

create policy "Residents can insert own diy cart"
  on public.diy_cart_items
  for insert
  to authenticated
  with check (public.is_resident() and resident_id = auth.uid());

create policy "Residents can update own diy cart"
  on public.diy_cart_items
  for update
  to authenticated
  using (public.is_resident() and resident_id = auth.uid())
  with check (public.is_resident() and resident_id = auth.uid());

create policy "Residents can delete own diy cart"
  on public.diy_cart_items
  for delete
  to authenticated
  using (public.is_resident() and resident_id = auth.uid());

create policy "Parties can read diy orders"
  on public.diy_orders
  for select
  to authenticated
  using (
    public.is_admin()
    or resident_id = auth.uid()
    or collector_id = auth.uid()
  );

-- Storage
insert into storage.buckets (id, name, public)
values ('diy-product-photos', 'diy-product-photos', false)
on conflict (id) do nothing;

create policy "Collectors can upload diy product photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'diy-product-photos'
    and public.is_collector()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated can read diy product photos"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'diy-product-photos');

create policy "Collectors can update own diy product photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'diy-product-photos'
    and public.is_collector()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Collectors can delete own diy product photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'diy-product-photos'
    and public.is_collector()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- RPCs
create or replace function public.submit_diy_product(p_product_id uuid)
returns public.diy_products
language plpgsql
security definer
set search_path = public
as $$
declare
  product public.diy_products;
  photo_count int;
  collector public.profiles;
begin
  if not public.is_collector() then
    raise exception 'Only collectors can submit products';
  end if;

  select * into product
  from public.diy_products
  where id = p_product_id and collector_id = auth.uid()
  for update;

  if product.id is null then
    raise exception 'Product not found';
  end if;

  if product.status not in ('draft', 'rejected', 'hidden') then
    raise exception 'This product cannot be submitted now';
  end if;

  select * into collector from public.profiles where id = auth.uid();

  if length(trim(product.title)) < 3 then
    raise exception 'Title is required';
  end if;
  if length(trim(product.description)) < 8 then
    raise exception 'Describe the piece';
  end if;
  if length(trim(product.ewaste_source)) < 8 then
    raise exception 'Say which e-waste this was made from';
  end if;
  if product.price <= 0 then
    raise exception 'Price must be greater than zero';
  end if;
  if product.stock < 1 then
    raise exception 'Stock must be at least 1 to submit';
  end if;
  if coalesce(trim(collector.default_gcash_number), '') = '' then
    raise exception 'Add a GCash number on your profile before submitting';
  end if;
  if coalesce(trim(collector.phone), '') = '' or coalesce(trim(collector.address), '') = '' then
    raise exception 'Add a phone and address on your profile before submitting';
  end if;

  select count(*) into photo_count
  from public.diy_product_photos
  where product_id = product.id;

  if photo_count < 1 then
    raise exception 'Add at least one photo';
  end if;

  update public.diy_products
  set
    status = 'pending_review',
    rejection_reason = null,
    collector_name = coalesce(collector.full_name, ''),
    collector_phone = collector.phone,
    collector_address = collector.address,
    collector_gcash_number = collector.default_gcash_number
  where id = product.id
  returning * into product;

  return product;
end;
$$;

create or replace function public.approve_diy_product(p_product_id uuid)
returns public.diy_products
language plpgsql
security definer
set search_path = public
as $$
declare
  product public.diy_products;
begin
  if not public.is_admin() then
    raise exception 'Only admins can approve products';
  end if;

  update public.diy_products
  set status = 'active', rejection_reason = null
  where id = p_product_id and status = 'pending_review'
  returning * into product;

  if product.id is null then
    raise exception 'Product is not waiting for review';
  end if;

  return product;
end;
$$;

create or replace function public.reject_diy_product(p_product_id uuid, p_reason text)
returns public.diy_products
language plpgsql
security definer
set search_path = public
as $$
declare
  product public.diy_products;
begin
  if not public.is_admin() then
    raise exception 'Only admins can reject products';
  end if;

  update public.diy_products
  set
    status = 'rejected',
    rejection_reason = nullif(trim(p_reason), '')
  where id = p_product_id and status = 'pending_review'
  returning * into product;

  if product.id is null then
    raise exception 'Product is not waiting for review';
  end if;

  return product;
end;
$$;

create or replace function public.hide_diy_product(p_product_id uuid)
returns public.diy_products
language plpgsql
security definer
set search_path = public
as $$
declare
  product public.diy_products;
begin
  if public.is_admin() then
    update public.diy_products
    set status = 'hidden'
    where id = p_product_id and status in ('active', 'pending_review')
    returning * into product;
  elsif public.is_collector() then
    update public.diy_products
    set status = 'hidden'
    where id = p_product_id and collector_id = auth.uid() and status = 'active'
    returning * into product;
  else
    raise exception 'Not allowed';
  end if;

  if product.id is null then
    raise exception 'Product cannot be hidden';
  end if;

  return product;
end;
$$;

create or replace function public.place_diy_order(
  p_product_id uuid,
  p_quantity integer,
  p_payment_method public.payout_method,
  p_fulfillment_method text,
  p_resident_phone text,
  p_delivery_address text,
  p_notes text default null
)
returns public.diy_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  product public.diy_products;
  collector public.profiles;
  resident public.profiles;
  new_order public.diy_orders;
  qty integer;
begin
  if not public.is_resident() then
    raise exception 'Only residents can place DIY orders';
  end if;

  qty := coalesce(p_quantity, 0);
  if qty < 1 then
    raise exception 'Quantity must be at least 1';
  end if;

  if p_fulfillment_method not in ('pickup', 'delivery') then
    raise exception 'Choose pickup or delivery';
  end if;

  select * into product
  from public.diy_products
  where id = p_product_id
  for update;

  if product.id is null or product.status <> 'active' then
    raise exception 'This product is not available';
  end if;

  if product.stock < qty then
    raise exception 'Not enough stock';
  end if;

  select * into collector from public.profiles where id = product.collector_id;
  select * into resident from public.profiles where id = auth.uid();

  if p_payment_method = 'gcash' and coalesce(trim(collector.default_gcash_number), '') = '' then
    raise exception 'This collector has no GCash number yet. Choose cash or pick another item.';
  end if;

  if p_fulfillment_method = 'delivery' then
    if coalesce(trim(p_resident_phone), '') = '' or coalesce(trim(p_delivery_address), '') = '' then
      raise exception 'Phone and delivery address are required for delivery';
    end if;
  else
    if coalesce(trim(collector.address), '') = '' or coalesce(trim(collector.phone), '') = '' then
      raise exception 'This collector has not set a pickup address yet';
    end if;
  end if;

  update public.diy_products
  set stock = stock - qty
  where id = product.id;

  insert into public.diy_orders (
    product_id,
    collector_id,
    resident_id,
    title,
    quantity,
    unit_price,
    total_amount,
    payment_method,
    collector_gcash_number,
    fulfillment_method,
    collector_name,
    collector_phone,
    collector_address,
    resident_name,
    resident_phone,
    delivery_address,
    notes,
    status
  ) values (
    product.id,
    product.collector_id,
    auth.uid(),
    product.title,
    qty,
    product.price,
    product.price * qty,
    p_payment_method,
    case when p_payment_method = 'gcash' then collector.default_gcash_number else null end,
    p_fulfillment_method,
    coalesce(collector.full_name, ''),
    collector.phone,
    collector.address,
    coalesce(resident.full_name, ''),
    coalesce(nullif(trim(p_resident_phone), ''), resident.phone),
    case when p_fulfillment_method = 'delivery' then trim(p_delivery_address) else null end,
    nullif(trim(p_notes), ''),
    'pending_payment'
  )
  returning * into new_order;

  delete from public.diy_cart_items
  where resident_id = auth.uid() and product_id = product.id;

  return new_order;
end;
$$;

create or replace function public.diy_restore_stock(p_order public.diy_orders)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_order.status = 'pending_payment' then
    update public.diy_products
    set stock = stock + p_order.quantity
    where id = p_order.product_id;
  end if;
end;
$$;

create or replace function public.cancel_diy_order(p_order_id uuid)
returns public.diy_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.diy_orders;
begin
  if not public.is_resident() then
    raise exception 'Only residents can cancel their orders';
  end if;

  select * into order_row
  from public.diy_orders
  where id = p_order_id and resident_id = auth.uid()
  for update;

  if order_row.id is null then
    raise exception 'Order not found';
  end if;

  if order_row.status <> 'pending_payment' then
    raise exception 'This order can no longer be cancelled';
  end if;

  perform public.diy_restore_stock(order_row);

  update public.diy_orders
  set status = 'cancelled', cancelled_at = now()
  where id = order_row.id
  returning * into order_row;

  return order_row;
end;
$$;

create or replace function public.reject_diy_order(p_order_id uuid, p_reason text default null)
returns public.diy_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.diy_orders;
begin
  if not public.is_collector() then
    raise exception 'Only collectors can reject orders';
  end if;

  select * into order_row
  from public.diy_orders
  where id = p_order_id and collector_id = auth.uid()
  for update;

  if order_row.id is null then
    raise exception 'Order not found';
  end if;

  if order_row.status <> 'pending_payment' then
    raise exception 'This order can no longer be rejected';
  end if;

  perform public.diy_restore_stock(order_row);

  update public.diy_orders
  set
    status = 'rejected',
    rejection_reason = nullif(trim(p_reason), ''),
    cancelled_at = now()
  where id = order_row.id
  returning * into order_row;

  return order_row;
end;
$$;

create or replace function public.mark_diy_order_paid(p_order_id uuid)
returns public.diy_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.diy_orders;
begin
  if not public.is_collector() then
    raise exception 'Only collectors can mark payment received';
  end if;

  update public.diy_orders
  set status = 'paid', paid_at = now()
  where id = p_order_id
    and collector_id = auth.uid()
    and status = 'pending_payment'
  returning * into order_row;

  if order_row.id is null then
    raise exception 'Order is not waiting for payment';
  end if;

  return order_row;
end;
$$;

create or replace function public.fulfill_diy_order(p_order_id uuid)
returns public.diy_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.diy_orders;
  next_status public.diy_order_status;
begin
  if not public.is_collector() then
    raise exception 'Only collectors can update fulfillment';
  end if;

  select * into order_row
  from public.diy_orders
  where id = p_order_id and collector_id = auth.uid()
  for update;

  if order_row.id is null then
    raise exception 'Order not found';
  end if;

  if order_row.status <> 'paid' then
    raise exception 'Mark the order paid first';
  end if;

  next_status := case
    when order_row.fulfillment_method = 'delivery' then 'out_for_delivery'::public.diy_order_status
    else 'ready'::public.diy_order_status
  end;

  update public.diy_orders
  set status = next_status
  where id = order_row.id
  returning * into order_row;

  return order_row;
end;
$$;

create or replace function public.complete_diy_order(p_order_id uuid)
returns public.diy_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.diy_orders;
begin
  if not public.is_resident() then
    raise exception 'Only residents can mark an order received';
  end if;

  update public.diy_orders
  set status = 'completed', completed_at = now()
  where id = p_order_id
    and resident_id = auth.uid()
    and status in ('ready', 'out_for_delivery')
  returning * into order_row;

  if order_row.id is null then
    raise exception 'This order is not ready to complete';
  end if;

  return order_row;
end;
$$;

grant execute on function public.submit_diy_product(uuid) to authenticated;
grant execute on function public.approve_diy_product(uuid) to authenticated;
grant execute on function public.reject_diy_product(uuid, text) to authenticated;
grant execute on function public.hide_diy_product(uuid) to authenticated;
grant execute on function public.place_diy_order(uuid, integer, public.payout_method, text, text, text, text) to authenticated;
grant execute on function public.cancel_diy_order(uuid) to authenticated;
grant execute on function public.reject_diy_order(uuid, text) to authenticated;
grant execute on function public.mark_diy_order_paid(uuid) to authenticated;
grant execute on function public.fulfill_diy_order(uuid) to authenticated;
grant execute on function public.complete_diy_order(uuid) to authenticated;

grant select, insert, update, delete on public.diy_products to authenticated;
grant select, insert, delete on public.diy_product_photos to authenticated;
grant select, insert, update, delete on public.diy_cart_items to authenticated;
grant select on public.diy_orders to authenticated;

do $pub$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.diy_products;
    exception
      when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.diy_orders;
    exception
      when duplicate_object then null;
    end;
  end if;
end
$pub$;
