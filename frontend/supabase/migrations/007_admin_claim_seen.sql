-- Unseen collector claims for the admin inbox.

alter table public.listings
  add column if not exists claimed_seen_at timestamptz;
