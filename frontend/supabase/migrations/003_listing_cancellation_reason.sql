-- Add cancellation reason for resident-cancelled listings.

alter table public.listings
  add column if not exists cancellation_reason text,
  add column if not exists cancelled_at timestamptz;
