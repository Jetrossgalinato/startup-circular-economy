-- Admin cross-dock intake: RLS, resale_eligible, demo queue/stock seeds.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.listings
  add column if not exists resale_eligible boolean not null default true;

create policy "Admins can read all listings"
  on public.listings
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all listings"
  on public.listings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read all listing photos"
  on public.listing_photos
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can read all listing photo objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and public.is_admin()
  );

create policy "Admins can read all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can read all rate card categories"
  on public.rate_card_categories
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update rate card categories"
  on public.rate_card_categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Demo listings for intake + collector stock. Attached to the first resident
-- profile if one exists. Skip quietly when no resident is registered yet.
insert into public.listings (
  resident_id,
  category_code,
  condition,
  hazard_tier,
  triage_reasons,
  triage_flags,
  status,
  payout_method,
  pickup_address,
  pickup_notes,
  preferred_pickup_window,
  quoted_rate_per_kg,
  resale_eligible
)
select
  p.id,
  'D',
  '{"powersOn":false,"unknownCondition":true,"batteryPresent":true}'::jsonb,
  2,
  array['Unknown internal condition','Device does not power on'],
  array['unknown_condition'],
  'pickup_scheduled',
  'gcash',
  'Demo pickup — Butuan City (seed)',
  'DEMO_INTAKE_SEED',
  'Tomorrow · morning (8am–12pm)',
  45.00,
  true
from public.profiles p
where p.role = 'resident'
  and not exists (
    select 1 from public.listings l where l.pickup_notes = 'DEMO_INTAKE_SEED'
  )
order by p.created_at asc
limit 1;

insert into public.listings (
  resident_id,
  category_code,
  condition,
  hazard_tier,
  triage_reasons,
  triage_flags,
  status,
  payout_method,
  pickup_address,
  pickup_notes,
  preferred_pickup_window,
  quoted_rate_per_kg,
  resale_eligible
)
select
  p.id,
  'C',
  '{"powersOn":true,"crackedCasing":true}'::jsonb,
  2,
  array['Cracked casing'],
  array['cracked_casing'],
  'pickup_scheduled',
  'cash',
  'Demo pickup — Libertad, Butuan City (seed)',
  'DEMO_INTAKE_SEED',
  'Today · afternoon (12pm–5pm)',
  20.00,
  true
from public.profiles p
where p.role = 'resident'
  and (
    select count(*) from public.listings l where l.pickup_notes = 'DEMO_INTAKE_SEED'
  ) < 2
order by p.created_at asc
limit 1;

insert into public.listings (
  resident_id,
  category_code,
  condition,
  hazard_tier,
  triage_reasons,
  triage_flags,
  status,
  payout_method,
  pickup_address,
  pickup_notes,
  preferred_pickup_window,
  weight_kg,
  quoted_rate_per_kg,
  final_amount,
  resale_eligible
)
select
  p.id,
  'A',
  '{"powersOn":true}'::jsonb,
  1,
  array['No swelling, leakage, cracked casing, or exposed wiring flagged'],
  array['standard'],
  'paid',
  'gcash',
  'Demo stock — already paid (seed)',
  'DEMO_STOCK_SEED',
  'Completed',
  12.500,
  25.00,
  312.50,
  true
from public.profiles p
where p.role = 'resident'
  and not exists (
    select 1 from public.listings l where l.pickup_notes = 'DEMO_STOCK_SEED'
  )
order by p.created_at asc
limit 1;
