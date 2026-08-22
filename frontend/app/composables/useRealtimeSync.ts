import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { toast } from 'vue-sonner'
import { RESIDENT_CACHE_KEYS } from '@/constants/resident/cache'
import { ADMIN_CACHE_KEYS } from '@/constants/admin/cache'
import { COLLECTOR_CACHE_KEYS } from '@/constants/collector/cache'

const LISTINGS_TICK_KEY = 'realtime-listings-tick'
const RATE_CARD_TICK_KEY = 'realtime-rate-card-tick'

export function useRealtimeTicks() {
  const listingsTick = useState(LISTINGS_TICK_KEY, () => 0)
  const rateCardTick = useState(RATE_CARD_TICK_KEY, () => 0)
  return { listingsTick, rateCardTick }
}

/**
 * Subscribes to Supabase postgres_changes for listings and rate_card_categories.
 * Invalidates in-session caches and bumps ticks so open pages can refetch.
 */
export function useRealtimeSync() {
  const supabase = useSupabase()
  const { session, profile } = useAuth()
  const cache = useResidentCache()
  const { listingsTick, rateCardTick } = useRealtimeTicks()

  let channel: RealtimeChannel | null = null

  function bumpListings() {
    cache.invalidate(RESIDENT_CACHE_KEYS.listings)
    cache.invalidate(RESIDENT_CACHE_KEYS.listingPrefix)
    cache.invalidate(ADMIN_CACHE_KEYS.opsSummary)
    cache.invalidate(ADMIN_CACHE_KEYS.intakeQueue)
    cache.invalidate(ADMIN_CACHE_KEYS.listings)
    cache.invalidate(ADMIN_CACHE_KEYS.listingPrefix)
    cache.invalidate(COLLECTOR_CACHE_KEYS.catalog)
    cache.invalidate(COLLECTOR_CACHE_KEYS.orders)
    cache.invalidate(COLLECTOR_CACHE_KEYS.listingPrefix)
    cache.invalidate(ADMIN_CACHE_KEYS.claims)
    cache.invalidate(ADMIN_CACHE_KEYS.claimsUnread)
    listingsTick.value += 1
  }

  function onListingChange(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    bumpListings()

    const next = payload.new as { status?: string, fulfillment_method?: string } | undefined
    const prev = payload.old as { status?: string } | undefined
    if (
      profile.value?.role === 'admin'
      && next?.status === 'claimed'
      && prev?.status !== 'claimed'
    ) {
      toast.success('New collector claim', {
        description: next.fulfillment_method === 'delivery'
          ? 'Collector requested delivery.'
          : 'Collector will pick up at the cross-dock.',
      })
    }
  }

  function bumpRateCard() {
    cache.invalidate(RESIDENT_CACHE_KEYS.rateCard)
    cache.invalidate(ADMIN_CACHE_KEYS.rateCardAll)
    rateCardTick.value += 1
  }

  function stop() {
    if (channel) {
      void supabase.removeChannel(channel)
      channel = null
    }
  }

  function start() {
    if (import.meta.server || channel) {
      return
    }

    channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        (payload) => {
          onListingChange(payload)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rate_card_categories' },
        () => {
          bumpRateCard()
        },
      )
      .subscribe()
  }

  watch(
    session,
    (next) => {
      stop()
      if (next) {
        start()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stop()
  })
}
