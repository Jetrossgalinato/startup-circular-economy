import {
  EMPTY_CONDITION,
  type HazardTier,
  type Listing,
  type ListingCondition,
  type ListingStatus,
  type PayoutMethod,
} from '@/types/listings'

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
  const { writeListingThrough, invalidateListings } = useListings()

  async function fetchListing(id: string): Promise<Listing | null> {
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

  async function fetchIntakeQueue(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(ADMIN_LISTING_SELECT)
      .eq('status', 'pickup_scheduled')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row) => normalizeAdminListing(row as Record<string, unknown>))
  }

  async function fetchAllListings(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(ADMIN_LISTING_SELECT)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row) => normalizeAdminListing(row as Record<string, unknown>))
  }

  async function fetchOpsSummary(): Promise<AdminOpsSummary> {
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
    return listing
  }

  return {
    fetchListing,
    fetchIntakeQueue,
    fetchAllListings,
    fetchOpsSummary,
    completeIntake,
  }
}
