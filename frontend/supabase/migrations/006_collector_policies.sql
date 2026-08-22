-- Policies that use listing_status = claimed (must run after enum value is committed).

create policy "Collectors can read catalog and own claims"
  on public.listings
  for select
  to authenticated
  using (
    public.is_collector()
    and (
      (status = 'paid' and resale_eligible = true)
      or claimed_by = auth.uid()
    )
  );

create policy "Collectors can claim available stock"
  on public.listings
  for update
  to authenticated
  using (
    public.is_collector()
    and status = 'paid'
    and resale_eligible = true
    and claimed_by is null
  )
  with check (
    public.is_collector()
    and status = 'claimed'
    and claimed_by = auth.uid()
    and fulfillment_method in ('pickup', 'delivery')
  );

create policy "Collectors can read catalog listing photos"
  on public.listing_photos
  for select
  to authenticated
  using (
    public.is_collector()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (
          (l.status = 'paid' and l.resale_eligible = true)
          or l.claimed_by = auth.uid()
        )
    )
  );

create policy "Collectors can read catalog photo objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and public.is_collector()
  );
