-- Collectors can unpublish listings that are live or waiting for review.

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
    elsif old.status = 'pending_review' and new.status in ('draft', 'hidden') then
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
    where id = p_product_id
      and collector_id = auth.uid()
      and status in ('active', 'pending_review')
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
