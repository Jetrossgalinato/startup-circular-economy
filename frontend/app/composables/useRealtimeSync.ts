import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { toast } from 'vue-sonner'
import { RESIDENT_CACHE_KEYS } from '@/constants/resident/cache'
import { ADMIN_CACHE_KEYS } from '@/constants/admin/cache'
import { COLLECTOR_CACHE_KEYS } from '@/constants/collector/cache'
import { CHAT_CACHE_KEYS } from '@/constants/chat'
import { collectorClaimMessage } from '@/utils/listings/claims'
import type { Listing } from '@/types/listings'
import type { ChatConversation } from '@/types/chat'

const LISTINGS_TICK_KEY = 'realtime-listings-tick'
const RATE_CARD_TICK_KEY = 'realtime-rate-card-tick'
const CHAT_TICK_KEY = 'realtime-chat-tick'

export function useRealtimeTicks() {
  const listingsTick = useState(LISTINGS_TICK_KEY, () => 0)
  const rateCardTick = useState(RATE_CARD_TICK_KEY, () => 0)
  const chatTick = useState(CHAT_TICK_KEY, () => 0)
  return { listingsTick, rateCardTick, chatTick }
}

/**
 * Subscribes to Supabase postgres_changes for listings and rate_card_categories.
 * Invalidates in-session caches and bumps ticks so open pages can refetch.
 */
export function useRealtimeSync() {
  const supabase = useSupabase()
  const { session, profile, user } = useAuth()
  const cache = useResidentCache()
  const route = useRoute()
  const { listingsTick, rateCardTick, chatTick } = useRealtimeTicks()

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

    const next = payload.new as {
      status?: string
      fulfillment_method?: string
      claimed_by?: string | null
      claim_confirmed_at?: string | null
    } | undefined
    const prev = payload.old as {
      status?: string
      claimed_by?: string | null
      claim_confirmed_at?: string | null
    } | undefined

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

    if (profile.value?.role === 'collector' && user.value) {
      if (
        next?.claimed_by === user.value.id
        && !prev?.claim_confirmed_at
        && next?.claim_confirmed_at
      ) {
        toast.success('Claim confirmed', {
          description: collectorClaimMessage({
            status: 'claimed',
            claim_confirmed_at: next.claim_confirmed_at,
            fulfillment_method: next.fulfillment_method ?? 'pickup',
          } as Listing),
        })
      }

      if (
        prev?.claimed_by === user.value.id
        && !next?.claimed_by
        && next?.status === 'paid'
      ) {
        toast.error('Claim declined', {
          description: 'This lot is back on Browse.',
        })
      }
    }
  }

  function bumpRateCard() {
    cache.invalidate(RESIDENT_CACHE_KEYS.rateCard)
    cache.invalidate(ADMIN_CACHE_KEYS.rateCardAll)
    rateCardTick.value += 1
  }

  let chatBumpTimer: ReturnType<typeof setTimeout> | null = null

  function bumpChat() {
    cache.invalidate(CHAT_CACHE_KEYS.inbox)
    cache.invalidate(CHAT_CACHE_KEYS.unread)
    cache.invalidate(CHAT_CACHE_KEYS.ownConversation)
    cache.invalidate(CHAT_CACHE_KEYS.threadPrefix)
    if (chatBumpTimer) {
      clearTimeout(chatBumpTimer)
    }
    chatBumpTimer = setTimeout(() => {
      chatTick.value += 1
      chatBumpTimer = null
    }, 80)
  }

  function isViewingThread(conversationId: string) {
    const path = route.path.replace(/\/$/, '')
    if (profile.value?.role === 'collector') {
      return path === '/collector/messages' || path.startsWith('/collector/messages/')
    }
    return path === `/admin/messages/${conversationId}`
  }

  function onMessageInsert(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
    bumpChat()

    const row = payload.new as {
      sender_id?: string
      conversation_id?: string
      collector_id?: string
    } | undefined

    if (!row?.sender_id || !row.conversation_id) {
      return
    }
    if (row.sender_id === user.value?.id) {
      return
    }
    if (isViewingThread(row.conversation_id)) {
      return
    }

    if (profile.value?.role === 'collector') {
      toast.success('New message from Admin', {
        description: 'Open chat to read it.',
      })
      return
    }

    if (profile.value?.role === 'admin' && row.sender_id === row.collector_id) {
      const inbox = cache.getCached<ChatConversation[]>(CHAT_CACHE_KEYS.inbox)?.data
      const name = inbox?.find((item) => item.id === row.conversation_id)?.collector?.full_name
      toast.success(`New message from ${name || 'a collector'}`, {
        description: 'Open Messages to reply.',
      })
    }
  }

  function stop() {
    if (chatBumpTimer) {
      clearTimeout(chatBumpTimer)
      chatBumpTimer = null
    }
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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          onMessageInsert(payload)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          bumpChat()
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
