import type { Listing } from '@/types/listings'
import {
  ADMIN_CACHE_KEYS,
  ADMIN_CACHE_TTL_MS,
  type AdminCacheFetchOptions,
} from '@/constants/admin/cache'

export function useAdminClaims() {
  const supabase = useSupabase()
  const cache = useResidentCache()
  const { fetchAllListings } = useAdminListings()

  function peekClaims(): Listing[] | null {
    return cache.getCached<Listing[]>(ADMIN_CACHE_KEYS.claims)?.data ?? null
  }

  function peekUnreadCount(): number | null {
    return cache.getCached<number>(ADMIN_CACHE_KEYS.claimsUnread)?.data ?? null
  }

  async function fetchClaimsFromNetwork(): Promise<Listing[]> {
    const listings = await fetchAllListings({ force: true })
    return listings
      .filter((listing) => listing.status === 'claimed')
      .sort((a, b) => {
        const aTime = new Date(a.claimed_at ?? a.updated_at).getTime()
        const bTime = new Date(b.claimed_at ?? b.updated_at).getTime()
        return bTime - aTime
      })
  }

  async function fetchClaims(
    options: AdminCacheFetchOptions = {},
  ): Promise<Listing[]> {
    const claims = await cache.swr(
      ADMIN_CACHE_KEYS.claims,
      ADMIN_CACHE_TTL_MS.claims,
      fetchClaimsFromNetwork,
      options,
    )
    const unread = claims.filter((listing) => !listing.claimed_seen_at).length
    cache.setCached(ADMIN_CACHE_KEYS.claimsUnread, unread)
    return claims
  }

  async function fetchUnreadCount(
    options: AdminCacheFetchOptions = {},
  ): Promise<number> {
    return cache.swr(
      ADMIN_CACHE_KEYS.claimsUnread,
      ADMIN_CACHE_TTL_MS.claimsUnread,
      async () => {
        const claims = await fetchClaims(options)
        return claims.filter((listing) => !listing.claimed_seen_at).length
      },
      options,
    )
  }

  async function markClaimsSeen(): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({ claimed_seen_at: new Date().toISOString() })
      .eq('status', 'claimed')
      .is('claimed_seen_at', null)

    if (error) {
      throw new Error(error.message)
    }

    cache.invalidate(ADMIN_CACHE_KEYS.claims)
    cache.invalidate(ADMIN_CACHE_KEYS.claimsUnread)
    cache.invalidate(ADMIN_CACHE_KEYS.listings)
    cache.setCached(ADMIN_CACHE_KEYS.claimsUnread, 0)
  }

  return {
    fetchClaims,
    fetchUnreadCount,
    markClaimsSeen,
    peekClaims,
    peekUnreadCount,
  }
}
