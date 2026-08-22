import type { Listing } from '@/types/listings'
import {
  ADMIN_CACHE_KEYS,
  ADMIN_CACHE_TTL_MS,
  type AdminCacheFetchOptions,
} from '@/constants/admin/cache'
import {
  claimedListings,
  stampClaimsSeen,
  unreadClaimCount,
} from '@/utils/listings/claims'

export function useAdminClaims() {
  const supabase = useSupabase()
  const cache = useResidentCache()
  const { fetchAllListings, peekAllListings } = useAdminListings()

  function peekClaims(): Listing[] | null {
    const cached = cache.getCached<Listing[]>(ADMIN_CACHE_KEYS.claims)?.data
    if (cached) {
      return cached
    }
    const all = peekAllListings()
    return all ? claimedListings(all) : null
  }

  function peekUnreadCount(): number | null {
    const cached = cache.getCached<number>(ADMIN_CACHE_KEYS.claimsUnread)?.data
    if (cached != null) {
      return cached
    }
    const claims = peekClaims()
    return claims ? unreadClaimCount(claims) : null
  }

  async function fetchClaimsFromNetwork(
    options: AdminCacheFetchOptions,
  ): Promise<Listing[]> {
    const listings = await fetchAllListings(options)
    return claimedListings(listings)
  }

  async function fetchClaims(
    options: AdminCacheFetchOptions = {},
  ): Promise<Listing[]> {
    const claims = await cache.swr(
      ADMIN_CACHE_KEYS.claims,
      ADMIN_CACHE_TTL_MS.claims,
      () => fetchClaimsFromNetwork(options),
      options,
    )
    cache.setCached(ADMIN_CACHE_KEYS.claimsUnread, unreadClaimCount(claims))
    return claims
  }

  async function fetchUnreadCount(
    options: AdminCacheFetchOptions = {},
  ): Promise<number> {
    return cache.swr(
      ADMIN_CACHE_KEYS.claimsUnread,
      ADMIN_CACHE_TTL_MS.claimsUnread,
      async () => unreadClaimCount(await fetchClaims(options)),
      options,
    )
  }

  async function markClaimsSeen(): Promise<Listing[]> {
    const seenAt = new Date().toISOString()
    const { error } = await supabase
      .from('listings')
      .update({ claimed_seen_at: seenAt })
      .eq('status', 'claimed')
      .is('claimed_seen_at', null)

    if (error) {
      throw new Error(error.message)
    }

    const current = peekClaims() ?? []
    const nextClaims = stampClaimsSeen(current, seenAt)
    cache.setCached(ADMIN_CACHE_KEYS.claims, nextClaims)
    cache.setCached(ADMIN_CACHE_KEYS.claimsUnread, 0)

    const all = peekAllListings()
    if (all) {
      const nextAll = stampClaimsSeen(all, seenAt)
      cache.setCached(ADMIN_CACHE_KEYS.listings, nextAll)
      for (const listing of nextAll) {
        cache.setCached(ADMIN_CACHE_KEYS.listing(listing.id), listing)
      }
    }

    return nextClaims
  }

  return {
    fetchClaims,
    fetchUnreadCount,
    markClaimsSeen,
    peekClaims,
    peekUnreadCount,
  }
}
