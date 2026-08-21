export type ListingStatus =
  | 'draft'
  | 'triaging'
  | 'awaiting_acceptance'
  | 'accepted'
  | 'pickup_scheduled'
  | 'weighed'
  | 'paid'
  | 'refused'
  | 'cancelled'

export type PayoutMethod = 'gcash' | 'cash'

export type HazardTier = 1 | 2 | 3 | 4

export type ListingCondition = {
  swelling: boolean
  leakage: boolean
  crackedCasing: boolean
  exposedWiring: boolean
  powersOn: boolean | null
  batteryPresent: boolean
  batteryHeatOrDamage: boolean
  crtGlass: boolean
  chemicalResidue: boolean
  fireOrHeatDamage: boolean
  radioactiveLabel: boolean
  unknownCondition: boolean
  notes: string
}

export type RateCardCategory = {
  code: string
  name: string
  examples: string
  rate_per_kg: number
  notes: string
  active: boolean
  sort_order: number
}

export type ListingPhoto = {
  id: string
  listing_id: string
  storage_path: string
  sort_order: number
  created_at: string
  signed_url?: string
}

export type Listing = {
  id: string
  resident_id: string
  category_code: string | null
  condition: ListingCondition
  hazard_tier: HazardTier | null
  triage_reasons: string[]
  triage_flags: string[]
  status: ListingStatus
  payout_method: PayoutMethod | null
  gcash_number: string | null
  pickup_address: string | null
  pickup_notes: string | null
  preferred_pickup_window: string | null
  weight_kg: number | null
  quoted_rate_per_kg: number | null
  final_amount: number | null
  cancellation_reason: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  listing_photos?: ListingPhoto[]
  rate_card_categories?: Pick<RateCardCategory, 'code' | 'name' | 'rate_per_kg'> | null
}

export type HazardTriageResult = {
  tier: HazardTier
  reasons: string[]
  flags: string[]
}

export type CreateListingInput = {
  category_code?: string | null
  condition?: Partial<ListingCondition>
}

export const EMPTY_CONDITION: ListingCondition = {
  swelling: false,
  leakage: false,
  crackedCasing: false,
  exposedWiring: false,
  powersOn: null,
  batteryPresent: false,
  batteryHeatOrDamage: false,
  crtGlass: false,
  chemicalResidue: false,
  fireOrHeatDamage: false,
  radioactiveLabel: false,
  unknownCondition: false,
  notes: '',
}

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Draft',
  triaging: 'Checking safety',
  awaiting_acceptance: 'Awaiting your acceptance',
  accepted: 'Accepted',
  pickup_scheduled: 'Pickup scheduled',
  weighed: 'Weighed — payout pending',
  paid: 'Paid',
  refused: 'Intake refused',
  cancelled: 'Cancelled',
}

/** Residents can cancel before logistics weigh-in or payout. */
export const CANCELLABLE_LISTING_STATUSES: ListingStatus[] = [
  'draft',
  'triaging',
  'awaiting_acceptance',
  'accepted',
  'pickup_scheduled',
]

export function canCancelListing(status: ListingStatus): boolean {
  return CANCELLABLE_LISTING_STATUSES.includes(status)
}

export const CANCELLATION_REASON_OPTIONS = [
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'item_unavailable', label: 'Item no longer available' },
  { value: 'wrong_details', label: 'Wrong category or details' },
  { value: 'schedule_conflict', label: 'Scheduling conflict' },
  { value: 'other', label: 'Other' },
] as const

export type CancellationReasonValue = (typeof CANCELLATION_REASON_OPTIONS)[number]['value']

export function formatCancellationReason(
  value: CancellationReasonValue | string,
  details?: string,
): string {
  const option = CANCELLATION_REASON_OPTIONS.find((item) => item.value === value)
  const label = option?.label ?? value
  const trimmed = details?.trim()
  if (value === 'other' && trimmed) {
    return `Other: ${trimmed}`
  }
  if (trimmed && value !== 'other') {
    return `${label} — ${trimmed}`
  }
  return label
}


