import {
  EMPTY_CONDITION,
  type CreateListingInput,
  type HazardTier,
  type Listing,
  type ListingCondition,
  type ListingStatus,
  type PayoutMethod,
} from '@/types/listings'

function normalizeListing(row: Record<string, unknown>): Listing {
  const condition = {
    ...EMPTY_CONDITION,
    ...((row.condition as Partial<ListingCondition> | null) ?? {}),
  }

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
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    listing_photos: (row.listing_photos as Listing['listing_photos']) ?? [],
    rate_card_categories: (row.rate_card_categories as Listing['rate_card_categories']) ?? null,
  }
}

const LISTING_SELECT = `
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
  created_at,
  updated_at,
  listing_photos ( id, listing_id, storage_path, sort_order, created_at ),
  rate_card_categories ( code, name, rate_per_kg )
`

export function useListings() {
  const supabase = useSupabase()
  const { user } = useAuth()

  async function createListing(input: CreateListingInput = {}): Promise<Listing> {
    if (!user.value) {
      throw new Error('You must be signed in to create a listing.')
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        resident_id: user.value.id,
        category_code: input.category_code ?? null,
        condition: { ...EMPTY_CONDITION, ...input.condition },
        status: 'draft',
      })
      .select(LISTING_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return normalizeListing(data)
  }

  async function fetchMyListings(): Promise<Listing[]> {
    if (!user.value) {
      return []
    }

    const { data, error } = await supabase
      .from('listings')
      .select(LISTING_SELECT)
      .eq('resident_id', user.value.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row) => normalizeListing(row))
  }

  async function fetchListing(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select(LISTING_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? normalizeListing(data) : null
  }

  async function updateListing(
    id: string,
    patch: Record<string, unknown>,
  ): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .update(patch)
      .eq('id', id)
      .select(LISTING_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return normalizeListing(data)
  }

  async function cancelListing(id: string, reason: string): Promise<Listing> {
    const trimmed = reason.trim()
    if (trimmed.length < 3) {
      throw new Error('Please provide a reason for cancellation.')
    }

    const current = await fetchListing(id)
    if (!current) {
      throw new Error('Listing not found.')
    }

    const cancellable = [
      'draft',
      'triaging',
      'awaiting_acceptance',
      'accepted',
      'pickup_scheduled',
    ]
    if (!cancellable.includes(current.status)) {
      throw new Error('This listing can no longer be cancelled.')
    }

    return updateListing(id, {
      status: 'cancelled',
      cancellation_reason: trimmed,
      cancelled_at: new Date().toISOString(),
    })
  }

  return {
    createListing,
    fetchMyListings,
    fetchListing,
    updateListing,
    cancelListing,
  }
}
