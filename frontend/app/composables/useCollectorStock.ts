import { EMPTY_CONDITION, type FulfillmentMethod, type Listing, type ListingPhoto } from '@/types/listings'
import {
  COLLECTOR_CACHE_KEYS,
  COLLECTOR_CACHE_TTL_MS,
  type CollectorCacheFetchOptions,
} from '@/constants/collector/cache'

const CATALOG_SELECT = `
  id,
  category_code,
  hazard_tier,
  status,
  weight_kg,
  quoted_rate_per_kg,
  final_amount,
  resale_eligible,
  claimed_by,
  claimed_at,
  fulfillment_method,
  delivery_address,
  claim_confirmed_at,
  created_at,
  updated_at,
  listing_photos ( id, listing_id, storage_path, sort_order, created_at ),
  rate_card_categories ( code, name, rate_per_kg )
`

function normalizeCatalogRow(row: Record<string, unknown>): Listing {
  return {
    id: row.id as string,
    resident_id: '',
    category_code: (row.category_code as string | null) ?? null,
    condition: { ...EMPTY_CONDITION },
    hazard_tier: (row.hazard_tier as Listing['hazard_tier']) ?? null,
    triage_reasons: [],
    triage_flags: [],
    status: row.status as Listing['status'],
    payout_method: null,
    gcash_number: null,
    pickup_address: null,
    pickup_notes: null,
    preferred_pickup_window: null,
    weight_kg: row.weight_kg != null ? Number(row.weight_kg) : null,
    quoted_rate_per_kg: row.quoted_rate_per_kg != null ? Number(row.quoted_rate_per_kg) : null,
    final_amount: row.final_amount != null ? Number(row.final_amount) : null,
    cancellation_reason: null,
    cancelled_at: null,
    resale_eligible: row.resale_eligible !== false,
    claimed_by: (row.claimed_by as string | null) ?? null,
    claimed_at: (row.claimed_at as string | null) ?? null,
    fulfillment_method: (row.fulfillment_method as FulfillmentMethod | null) ?? null,
    delivery_address: (row.delivery_address as string | null) ?? null,
    claimed_seen_at: (row.claimed_seen_at as string | null) ?? null,
    claim_confirmed_at: (row.claim_confirmed_at as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    listing_photos: (row.listing_photos as ListingPhoto[]) ?? [],
    rate_card_categories: (row.rate_card_categories as Listing['rate_card_categories']) ?? null,
  }
}

export type ClaimInput = {
  fulfillment: FulfillmentMethod
  deliveryAddress?: string
}

export function useCollectorStock() {
  const supabase = useSupabase()
  const { user } = useAuth()
  const cache = useResidentCache()

  function peekCatalog(): Listing[] | null {
    return cache.getCached<Listing[]>(COLLECTOR_CACHE_KEYS.catalog)?.data ?? null
  }

  function peekOrders(): Listing[] | null {
    return cache.getCached<Listing[]>(COLLECTOR_CACHE_KEYS.orders)?.data ?? null
  }

  function peekListing(id: string): Listing | null {
    return cache.getCached<Listing>(COLLECTOR_CACHE_KEYS.listing(id))?.data ?? null
  }

  function invalidateCollectorStock() {
    cache.invalidate(COLLECTOR_CACHE_KEYS.catalog)
    cache.invalidate(COLLECTOR_CACHE_KEYS.orders)
    cache.invalidate(COLLECTOR_CACHE_KEYS.listingPrefix)
  }

  function cacheListing(listing: Listing) {
    cache.setCached(COLLECTOR_CACHE_KEYS.listing(listing.id), listing)
  }

  async function fetchCatalogFromNetwork(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(CATALOG_SELECT)
      .eq('status', 'paid')
      .eq('resale_eligible', true)
      .is('claimed_by', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    const listings = (data ?? []).map((row) => normalizeCatalogRow(row as Record<string, unknown>))
    for (const listing of listings) {
      cacheListing(listing)
    }
    return listings
  }

  async function fetchCatalog(
    options: CollectorCacheFetchOptions = {},
  ): Promise<Listing[]> {
    return cache.swr(
      COLLECTOR_CACHE_KEYS.catalog,
      COLLECTOR_CACHE_TTL_MS.catalog,
      fetchCatalogFromNetwork,
      options,
    )
  }

  async function fetchOrdersFromNetwork(): Promise<Listing[]> {
    if (!user.value) {
      return []
    }

    const { data, error } = await supabase
      .from('listings')
      .select(CATALOG_SELECT)
      .eq('claimed_by', user.value.id)
      .eq('status', 'claimed')
      .order('claimed_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    const listings = (data ?? []).map((row) => normalizeCatalogRow(row as Record<string, unknown>))
    for (const listing of listings) {
      cacheListing(listing)
    }
    return listings
  }

  async function fetchOrders(
    options: CollectorCacheFetchOptions = {},
  ): Promise<Listing[]> {
    return cache.swr(
      COLLECTOR_CACHE_KEYS.orders,
      COLLECTOR_CACHE_TTL_MS.orders,
      fetchOrdersFromNetwork,
      options,
    )
  }

  async function fetchListingFromNetwork(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select(CATALOG_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? normalizeCatalogRow(data as Record<string, unknown>) : null
  }

  async function fetchListing(
    id: string,
    options: CollectorCacheFetchOptions = {},
  ): Promise<Listing | null> {
    return cache.swr(
      COLLECTOR_CACHE_KEYS.listing(id),
      COLLECTOR_CACHE_TTL_MS.listing,
      () => fetchListingFromNetwork(id),
      options,
    )
  }

  async function claimListing(id: string, input: ClaimInput): Promise<Listing> {
    if (!user.value) {
      throw new Error('You must be signed in to claim stock.')
    }

    if (input.fulfillment === 'delivery' && !input.deliveryAddress?.trim()) {
      throw new Error('Add a delivery address in your profile before claiming delivery.')
    }

    const { data, error } = await supabase
      .from('listings')
      .update({
        status: 'claimed',
        claimed_by: user.value.id,
        claimed_at: new Date().toISOString(),
        fulfillment_method: input.fulfillment,
        delivery_address: input.fulfillment === 'delivery'
          ? input.deliveryAddress?.trim()
          : null,
      })
      .eq('id', id)
      .eq('status', 'paid')
      .eq('resale_eligible', true)
      .is('claimed_by', null)
      .select(CATALOG_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const listing = normalizeCatalogRow(data as Record<string, unknown>)
    cacheListing(listing)
    cache.invalidate(COLLECTOR_CACHE_KEYS.catalog)
    cache.invalidate(COLLECTOR_CACHE_KEYS.orders)
    return listing
  }

  return {
    fetchCatalog,
    fetchOrders,
    fetchListing,
    claimListing,
    peekCatalog,
    peekOrders,
    peekListing,
    invalidateCollectorStock,
  }
}
