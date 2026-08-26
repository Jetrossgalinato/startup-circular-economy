-- Let collectors delete listings that are not live / in review.
-- Orders still block delete of products that were ordered (no ON DELETE CASCADE).

drop policy if exists "Collectors can delete own draft diy products" on public.diy_products;
drop policy if exists "Collectors can delete own unused diy products" on public.diy_products;

create policy "Collectors can delete own unused diy products"
  on public.diy_products
  for delete
  to authenticated
  using (
    public.is_collector()
    and collector_id = auth.uid()
    and status in ('draft', 'rejected', 'hidden')
  );
