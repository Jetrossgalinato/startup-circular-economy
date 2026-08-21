export const RESIDENT_CACHE_KEYS = {
  rateCard: 'resident-rate-card',
  listings: 'resident-listings',
  listing: (id: string) => `resident-listing:${id}`,
  store: 'resident-cache-store',
  pending: 'resident-cache-pending',
} as const

/** Time after which cached data is considered stale and revalidated in background. */
export const RESIDENT_CACHE_TTL_MS = {
  rateCard: 10 * 60 * 1000,
  listings: 30 * 1000,
  listing: 30 * 1000,
} as const

export type ResidentCacheFetchOptions = {
  force?: boolean
}
