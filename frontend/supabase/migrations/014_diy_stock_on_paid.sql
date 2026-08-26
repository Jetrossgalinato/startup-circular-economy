-- Stock is deducted only when the collector marks the order paid.
-- Unpaid orders must not hold inventory.

update public.diy_products p
set stock = p.stock + unpaid.qty
from (
  select product_id, sum(quantity) as qty
  from public.diy_orders
  where status = 'pending_payment'
  group by product_id
) unpaid
where p.id = unpaid.product_id;

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
  -- Stock is taken only on mark paid, so unpaid cancel/reject must not add it back.
  return;
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
  product public.diy_products;
begin
  if not public.is_collector() then
    raise exception 'Only collectors can mark payment received';
  end if;

  select * into order_row
  from public.diy_orders
  where id = p_order_id
    and collector_id = auth.uid()
    and status = 'pending_payment'
  for update;

  if order_row.id is null then
    raise exception 'Order is not waiting for payment';
  end if;

  select * into product
  from public.diy_products
  where id = order_row.product_id
  for update;

  if product.id is null or product.stock < order_row.quantity then
    raise exception 'Not enough stock to mark this paid';
  end if;

  update public.diy_products
  set stock = stock - order_row.quantity
  where id = product.id;

  update public.diy_orders
  set status = 'paid', paid_at = now()
  where id = order_row.id
  returning * into order_row;

  return order_row;
end;
$$;
