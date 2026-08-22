import type { RealtimeChannel } from '@supabase/supabase-js'
import { RESIDENT_CACHE_KEYS } from '@/constants/resident/cache'

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
  const { session } = useAuth()
  const cache = useResidentCache()
  const { listingsTick, rateCardTick } = useRealtimeTicks()

  let channel: RealtimeChannel | null = null

  function bumpListings() {
    cache.invalidate(RESIDENT_CACHE_KEYS.listings)
    cache.invalidate(RESIDENT_CACHE_KEYS.listingPrefix)
    listingsTick.value += 1
  }

  function bumpRateCard() {
    cache.invalidate(RESIDENT_CACHE_KEYS.rateCard)
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
        () => {
          bumpListings()
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
