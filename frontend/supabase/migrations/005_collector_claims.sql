-- Collector catalog + claims: pickup at cross-dock or delivery to collector.

create or replace function public.is_collector()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'collector' from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_collector() from public;
grant execute on function public.is_collector() to authenticated;

alter type public.listing_status add value if not exists 'claimed';

alter table public.listings
  add column if not exists claimed_by uuid references public.profiles (id),
  add column if not exists claimed_at timestamptz,
  add column if not exists fulfillment_method text
    check (fulfillment_method is null or fulfillment_method in ('pickup', 'delivery')),
  add column if not exists delivery_address text;

create index if not exists listings_claimed_by_idx on public.listings (claimed_by);
