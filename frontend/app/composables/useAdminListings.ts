import {
  EMPTY_CONDITION,
  type HazardTier,
  type Listing,
  type ListingCondition,
  type PayoutMethod,
  type ListingStatus,
} from '@/types/listings'
import {
  ADMIN_CACHE_KEYS,
  ADMIN_CACHE_TTL_MS,
  type AdminCacheFetchOptions,
} from '@/constants/admin/cache'

const ADMIN_LISTING_SELECT = `
  id,
  resident_id,
  category_code,
  condition,
  hazard_tier,
  triage_reasons,
  triage_flags,
  status,
  payout_method,
  gcash_number,
  pickup_address,
  pickup_notes,
  preferred_pickup_window,
  weight_kg,
  quoted_rate_per_kg,
  final_amount,
  cancellation_reason,
  cancelled_at,
  resale_eligible,
  created_at,
  updated_at,
  listing_photos ( id, listing_id, storage_path, sort_order, created_at ),
  rate_card_categories ( code, name, rate_per_kg ),
  resident:profiles!resident_id ( id, full_name, phone, address )
`

function normalizeAdminListing(row: Record<string, unknown>): Listing {
  const condition = {
    ...EMPTY_CONDITION,
    ...((row.condition as Partial<ListingCondition> | null) ?? {}),
  }

  const residentRow = row.resident as Listing['resident'] | Listing['resident'][] | null
  const resident = Array.isArray(residentRow) ? (residentRow[0] ?? null) : residentRow

  return {
    id: row.id as string,
    resident_id: row.resident_id as string,
    category_code: (row.category_code as string | null) ?? null,
    condition,
    hazard_tier: (row.hazard_tier as HazardTier | null) ?? null,
    triage_reasons: (row.triage_reasons as string[]) ?? [],
    triage_flags: (row.triage_flags as string[]) ?? [],
    status: row.status as ListingStatus,
    payout_method: (row.payout_method as PayoutMethod | null) ?? null,
    gcash_number: (row.gcash_number as string | null) ?? null,
    pickup_address: (row.pickup_address as string | null) ?? null,
    pickup_notes: (row.pickup_notes as string | null) ?? null,
    preferred_pickup_window: (row.preferred_pickup_window as string | null) ?? null,
    weight_kg: row.weight_kg != null ? Number(row.weight_kg) : null,
    quoted_rate_per_kg: row.quoted_rate_per_kg != null ? Number(row.quoted_rate_per_kg) : null,
    final_amount: row.final_amount != null ? Number(row.final_amount) : null,
    cancellation_reason: (row.cancellation_reason as string | null) ?? null,
    cancelled_at: (row.cancelled_at as string | null) ?? null,
    resale_eligible: row.resale_eligible !== false,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    listing_photos: (row.listing_photos as Listing['listing_photos']) ?? [],
    rate_card_categories: (row.rate_card_categories as Listing['rate_card_categories']) ?? null,
    resident: resident ?? null,
  }
}

export type AdminOpsSummary = {
  scheduled: number
  weighed: number
  paidToday: number
}

export type CompleteIntakeInput = {
  weightKg: number
  hazardTier: HazardTier
  quotedRatePerKg: number
}

export function useAdminListings() {
  const supabase = useSupabase()
  const cache = useResidentCache()
  const { writeListingThrough, invalidateListings } = useListings()

  function peekOpsSummary(): AdminOpsSummary | null {
    return cache.getCached<AdminOpsSummary>(ADMIN_CACHE_KEYS.opsSummary)?.data ?? null
  }

  function peekIntakeQueue(): Listing[] | null {
    return cache.getCached<Listing[]>(ADMIN_CACHE_KEYS.intakeQueue)?.data ?? null
  }

  function peekAllListings(): Listing[] | null {
    return cache.getCached<Listing[]>(ADMIN_CACHE_KEYS.listings)?.data ?? null
  }

  function peekListing(id: string): Listing | null {
    return cache.getCached<Listing>(ADMIN_CACHE_KEYS.listing(id))?.data ?? null
  }

  function writeAdminListingThrough(listing: Listing) {
    cache.setCached(ADMIN_CACHE_KEYS.listing(listing.id), listing)

    const queue = peekIntakeQueue()
    if (queue) {
      const without = queue.filter((item) => item.id !== listing.id)
      cache.setCached(
        ADMIN_CACHE_KEYS.intakeQueue,
        listing.status === 'pickup_scheduled'
          ? [...without, listing].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            )
          : without,
      )
    }

    const all = peekAllListings()
    if (all) {
      const without = all.filter((item) => item.id !== listing.id)
      cache.setCached(
        ADMIN_CACHE_KEYS.listings,
        [listing, ...without].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      )
    }

    cache.invalidate(ADMIN_CACHE_KEYS.opsSummary)
  }

  function invalidateAdminListings() {
    cache.invalidate(ADMIN_CACHE_KEYS.opsSummary)
    cache.invalidate(ADMIN_CACHE_KEYS.intakeQueue)
    cache.invalidate(ADMIN_CACHE_KEYS.listings)
    cache.invalidate(ADMIN_CACHE_KEYS.listingPrefix)
  }

  async function fetchListingFromNetwork(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select(ADMIN_LISTING_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? normalizeAdminListing(data as Record<string, unknown>) : null
  }

  async function fetchListing(
    id: string,
    options: AdminCacheFetchOptions = {},
  ): Promise<Listing | null> {
    return cache.swr(
      ADMIN_CACHE_KEYS.listing(id),
      ADMIN_CACHE_TTL_MS.listing,
      () => fetchListingFromNetwork(id),
      options,
    )
  }

  async function fetchIntakeQueueFromNetwork(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(ADMIN_LISTING_SELECT)
      .eq('status', 'pickup_scheduled')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const listings = (data ?? []).map((row) => normalizeAdminListing(row as Record<string, unknown>))
    for (const listing of listings) {
      cache.setCached(ADMIN_CACHE_KEYS.listing(listing.id), listing)
    }
    return listings
  }

  async function fetchIntakeQueue(
    options: AdminCacheFetchOptions = {},
  ): Promise<Listing[]> {
    return cache.swr(
      ADMIN_CACHE_KEYS.intakeQueue,
      ADMIN_CACHE_TTL_MS.intakeQueue,
      fetchIntakeQueueFromNetwork,
      options,
    )
  }

  async function fetchAllListingsFromNetwork(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(ADMIN_LISTING_SELECT)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    const listings = (data ?? []).map((row) => normalizeAdminListing(row as Record<string, unknown>))
    for (const listing of listings) {
      cache.setCached(ADMIN_CACHE_KEYS.listing(listing.id), listing)
    }
    return listings
  }

  async function fetchAllListings(
    options: AdminCacheFetchOptions = {},
  ): Promise<Listing[]> {
    return cache.swr(
      ADMIN_CACHE_KEYS.listings,
      ADMIN_CACHE_TTL_MS.listings,
      fetchAllListingsFromNetwork,
      options,
    )
  }

  async function fetchOpsSummaryFromNetwork(): Promise<AdminOpsSummary> {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [scheduledRes, weighedRes, paidRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pickup_scheduled'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'weighed'),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'paid')
        .gte('updated_at', startOfToday.toISOString()),
    ])

    if (scheduledRes.error) throw new Error(scheduledRes.error.message)
    if (weighedRes.error) throw new Error(weighedRes.error.message)
    if (paidRes.error) throw new Error(paidRes.error.message)

    return {
      scheduled: scheduledRes.count ?? 0,
      weighed: weighedRes.count ?? 0,
      paidToday: paidRes.count ?? 0,
    }
  }

  async function fetchOpsSummary(
    options: AdminCacheFetchOptions = {},
  ): Promise<AdminOpsSummary> {
    return cache.swr(
      ADMIN_CACHE_KEYS.opsSummary,
      ADMIN_CACHE_TTL_MS.opsSummary,
      fetchOpsSummaryFromNetwork,
      options,
    )
  }

  async function completeIntake(id: string, input: CompleteIntakeInput): Promise<Listing> {
    if (input.hazardTier === 4) {
      const { data, error } = await supabase
        .from('listings')
        .update({
          hazard_tier: 4,
          resale_eligible: false,
          status: 'refused',
        })
        .eq('id', id)
        .select(ADMIN_LISTING_SELECT)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const listing = normalizeAdminListing(data as Record<string, unknown>)
      writeListingThrough(listing)
      invalidateListings()
      writeAdminListingThrough(listing)
      return listing
    }

    if (!(input.weightKg > 0)) {
      throw new Error('Enter a weight greater than 0 kg.')
    }

    const finalAmount = Number((input.weightKg * input.quotedRatePerKg).toFixed(2))

    const { data, error } = await supabase
      .from('listings')
      .update({
        weight_kg: input.weightKg,
        hazard_tier: input.hazardTier,
        quoted_rate_per_kg: input.quotedRatePerKg,
        final_amount: finalAmount,
        resale_eligible: input.hazardTier <= 2,
        status: 'paid',
      })
      .eq('id', id)
      .select(ADMIN_LISTING_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const listing = normalizeAdminListing(data as Record<string, unknown>)
    writeListingThrough(listing)
    invalidateListings()
    writeAdminListingThrough(listing)
    return listing
  }

  return {
    fetchListing,
    fetchIntakeQueue,
    fetchAllListings,
    fetchOpsSummary,
    completeIntake,
    peekOpsSummary,
    peekIntakeQueue,
    peekAllListings,
    peekListing,
    invalidateAdminListings,
  }
}
