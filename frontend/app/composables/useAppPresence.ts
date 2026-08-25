import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js'
import type { UserRole } from '@/types/auth'

type OnlinePresence = {
  userId: string
  role: UserRole
}

const MEMBERS_KEY = 'app-online-members'

function flattenPresence(state: RealtimePresenceState<OnlinePresence>): OnlinePresence[] {
  const next: OnlinePresence[] = []
  const seen = new Set<string>()
  for (const presences of Object.values(state)) {
    for (const presence of presences) {
      if (!presence.userId || !presence.role) {
        continue
      }
      if (seen.has(presence.userId)) {
        continue
      }
      seen.add(presence.userId)
      next.push({
        userId: presence.userId,
        role: presence.role,
      })
    }
  }
  return next
}

let channel: RealtimeChannel | null = null

export function useAppPresence() {
  const { user } = useAuth()
  const members = useState<OnlinePresence[]>(MEMBERS_KEY, () => [])

  const isAdminOnline = computed(() =>
    members.value.some((member) =>
      member.role === 'admin' && member.userId !== user.value?.id,
    ),
  )

  function isUserOnline(userId: string | null | undefined) {
    if (!userId || userId === user.value?.id) {
      return false
    }
    return members.value.some((member) => member.userId === userId)
  }

  return {
    isAdminOnline,
    isUserOnline,
  }
}

/** Owns the app-online channel. Call once from RealtimeSync. */
export function useAppPresenceSync() {
  const supabase = useSupabase()
  const { session, user, profile } = useAuth()
  const members = useState<OnlinePresence[]>(MEMBERS_KEY, () => [])

  function syncPresence() {
    if (!channel) {
      members.value = []
      return
    }
    members.value = flattenPresence(channel.presenceState<OnlinePresence>())
  }

  function stop() {
    if (channel) {
      void supabase.removeChannel(channel)
      channel = null
    }
    members.value = []
  }

  function start() {
    if (import.meta.server || channel) {
      return
    }
    const currentUser = user.value
    const role = profile.value?.role
    if (!currentUser || (role !== 'admin' && role !== 'collector')) {
      return
    }

    channel = supabase.channel('app-online', {
      config: {
        presence: { key: currentUser.id },
      },
    })
    channel.on('presence', { event: 'sync' }, syncPresence)
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && channel && user.value && profile.value) {
        const nextRole = profile.value.role
        if (nextRole !== 'admin' && nextRole !== 'collector') {
          return
        }
        void channel.track({
          userId: currentUser.id,
          role: nextRole,
        } satisfies OnlinePresence)
      }
    })
  }

  watch(
    [session, () => profile.value?.role],
    () => {
      stop()
      if (session.value) {
        start()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stop()
  })
}
