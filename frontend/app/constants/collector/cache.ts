export const COLLECTOR_CACHE_KEYS = {
  catalog: 'collector-catalog',
  orders: 'collector-orders',
  listing: (id: string) => `collector-listing:${id}`,
  listingPrefix: 'collector-listing:',
} as const

export const COLLECTOR_CACHE_TTL_MS = {
  catalog: 30 * 1000,
  orders: 30 * 1000,
  listing: 30 * 1000,
} as const

export type CollectorCacheFetchOptions = {
  force?: boolean
}
