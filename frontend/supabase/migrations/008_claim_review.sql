-- Admin confirm/reject for collector claims. Pending = claimed + claim_confirmed_at is null.

alter table public.listings
  add column if not exists claim_confirmed_at timestamptz;

-- Realtime UPDATE payloads need old row fields (status, claimed_by, claim_confirmed_at).
alter table public.listings replica identity full;
