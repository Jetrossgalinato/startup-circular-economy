export const ADMIN_CACHE_KEYS = {
  opsSummary: 'admin-ops-summary',
  intakeQueue: 'admin-intake-queue',
  listings: 'admin-listings',
  listing: (id: string) => `admin-listing:${id}`,
  listingPrefix: 'admin-listing:',
  rateCardAll: 'admin-rate-card-all',
  claims: 'admin-claims',
  claimsUnread: 'admin-claims-unread',
} as const

export const ADMIN_CACHE_TTL_MS = {
  opsSummary: 30 * 1000,
  intakeQueue: 30 * 1000,
  listings: 30 * 1000,
  listing: 30 * 1000,
  rateCardAll: 10 * 60 * 1000,
  claims: 30 * 1000,
  claimsUnread: 15 * 1000,
} as const

export type AdminCacheFetchOptions = {
  force?: boolean
}
