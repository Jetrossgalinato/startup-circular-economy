import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js'
import type { UserRole } from '@/types/auth'

type TypingPresence = {
  userId: string
  role: UserRole
  name: string
}

const IDLE_MS = 2000

function flattenPresence(state: RealtimePresenceState<TypingPresence>): TypingPresence[] {
  const next: TypingPresence[] = []
  for (const presences of Object.values(state)) {
    for (const presence of presences) {
      if (presence.userId && presence.role) {
        next.push({
          userId: presence.userId,
          role: presence.role,
          name: presence.name || '',
        })
      }
    }
  }
  return next
}

function labelForPresence(presence: TypingPresence) {
  if (presence.role === 'admin') {
    return 'Admin'
  }
  return presence.name.trim() || 'Collector'
}

export function useChatTyping(conversationId: MaybeRefOrGetter<string | null | undefined>) {
  const supabase = useSupabase()
  const { user, profile } = useAuth()

  const others = ref<TypingPresence[]>([])
  let channel: RealtimeChannel | null = null
  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let tracked = false

  const typingLines = computed(() => {
    const labels = new Set<string>()
    for (const presence of others.value) {
      if (presence.userId === user.value?.id) {
        continue
      }
      labels.add(labelForPresence(presence))
    }
    return [...labels]
  })

  function syncPresence() {
    if (!channel) {
      others.value = []
      return
    }
    others.value = flattenPresence(channel.presenceState<TypingPresence>())
  }

  function clearIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
  }

  async function stopTyping() {
    clearIdleTimer()
    if (!tracked || !channel) {
      tracked = false
      return
    }
    tracked = false
    await channel.untrack()
  }

  async function notifyTyping() {
    const id = toValue(conversationId)
    if (!id || !channel || !user.value || !profile.value) {
      return
    }
    if (profile.value.role !== 'admin' && profile.value.role !== 'collector') {
      return
    }

    if (!tracked) {
      tracked = true
      await channel.track({
        userId: user.value.id,
        role: profile.value.role,
        name: profile.value.full_name,
      } satisfies TypingPresence)
    }

    clearIdleTimer()
    idleTimer = setTimeout(() => {
      void stopTyping()
    }, IDLE_MS)
  }

  function leave() {
    void stopTyping()
    if (channel) {
      void supabase.removeChannel(channel)
      channel = null
    }
    others.value = []
  }

  function join(id: string) {
    leave()
    const key = user.value?.id ?? 'anon'
    channel = supabase.channel(`chat-typing:${id}`, {
      config: {
        presence: { key },
      },
    })
    channel.on('presence', { event: 'sync' }, syncPresence)
    channel.subscribe()
  }

  watch(
    () => toValue(conversationId) ?? null,
    (id) => {
      if (id) {
        join(id)
      }
      else {
        leave()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    leave()
  })

  return {
    typingLines,
    notifyTyping,
    stopTyping,
  }
}
