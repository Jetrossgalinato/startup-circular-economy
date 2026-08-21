-- Resident B2C sell MVP: rate card, listings, photos, storage, profile payout fields.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists default_gcash_number text,
  add column if not exists default_payout_method text
    check (default_payout_method is null or default_payout_method in ('gcash', 'cash'));

drop policy if exists "Users can update own full_name" on public.profiles;

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create type public.listing_status as enum (
  'draft',
  'triaging',
  'awaiting_acceptance',
  'accepted',
  'pickup_scheduled',
  'weighed',
  'paid',
  'refused',
  'cancelled'
);

create type public.payout_method as enum ('gcash', 'cash');

create table public.rate_card_categories (
  code text primary key,
  name text not null,
  examples text not null default '',
  rate_per_kg numeric(10, 2) not null,
  notes text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rate_card_categories enable row level security;

create policy "Authenticated users can read active rate card"
  on public.rate_card_categories
  for select
  to authenticated
  using (active = true);

insert into public.rate_card_categories (code, name, examples, rate_per_kg, notes, sort_order) values
  ('A', 'Large appliances', 'Refrigerators, washing machines, aircon units', 25.00, 'Compressor/copper premium where applicable', 1),
  ('B', 'Displays', 'LED/LCD monitors & TVs', 35.00, '', 2),
  ('B1', 'Legacy CRT displays', 'CRT TVs and monitors', 15.00, 'Leaded glass — Tier 2 caution by default', 3),
  ('C', 'Small appliances', 'Rice cookers, blenders, microwaves', 20.00, '', 4),
  ('D', 'Computing & mobile', 'Laptops, desktops, phones, tablets', 45.00, 'Data-wipe required before intake', 5),
  ('E', 'Batteries', 'Li-ion, lead-acid, NiMH', 5.00, 'Handling fee basis; automatic Tier 3 until cleared', 6),
  ('F', 'Cables & wiring', 'Power cords, network cable, chargers', 40.00, 'By copper content', 7),
  ('G', 'Mixed / uncategorized', 'Circuit boards, unidentified components', 18.00, 'Admin discretion within floor/ceiling', 8);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.profiles (id) on delete cascade,
  category_code text references public.rate_card_categories (code),
  condition jsonb not null default '{}'::jsonb,
  hazard_tier smallint check (hazard_tier is null or hazard_tier between 1 and 4),
  triage_reasons text[] not null default '{}',
  triage_flags text[] not null default '{}',
  status public.listing_status not null default 'draft',
  payout_method public.payout_method,
  gcash_number text,
  pickup_address text,
  pickup_notes text,
  preferred_pickup_window text,
  weight_kg numeric(10, 3),
  quoted_rate_per_kg numeric(10, 2),
  final_amount numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_resident_id_idx on public.listings (resident_id);
create index listings_status_idx on public.listings (status);

alter table public.listings enable row level security;

create policy "Residents can read own listings"
  on public.listings
  for select
  to authenticated
  using (auth.uid() = resident_id);

create policy "Residents can insert own listings"
  on public.listings
  for insert
  to authenticated
  with check (auth.uid() = resident_id);

create policy "Residents can update own listings"
  on public.listings
  for update
  to authenticated
  using (auth.uid() = resident_id)
  with check (auth.uid() = resident_id);

create policy "Residents can delete own draft listings"
  on public.listings
  for delete
  to authenticated
  using (auth.uid() = resident_id and status in ('draft', 'cancelled'));

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index listing_photos_listing_id_idx on public.listing_photos (listing_id);

alter table public.listing_photos enable row level security;

create policy "Residents can read own listing photos"
  on public.listing_photos
  for select
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.resident_id = auth.uid()
    )
  );

create policy "Residents can insert own listing photos"
  on public.listing_photos
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.resident_id = auth.uid()
    )
  );

create policy "Residents can delete own listing photos"
  on public.listing_photos
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.resident_id = auth.uid()
    )
  );

-- Storage bucket for listing photos
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', false)
on conflict (id) do nothing;

create policy "Residents can upload own listing photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Residents can read own listing photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Residents can update own listing photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Residents can delete own listing photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_set_updated_at
  before update on public.listings
  for each row
  execute function public.set_updated_at();

create trigger rate_card_set_updated_at
  before update on public.rate_card_categories
  for each row
  execute function public.set_updated_at();
