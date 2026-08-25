<script setup lang="ts">
import { MessageCircle } from '@lucide/vue'
import { formatUnreadBadge } from '@/utils/chat'

const { profile } = useAuth()
const route = useRoute()
const { fetchUnreadCount, peekUnreadCount } = useChat()
const { chatTick } = useRealtimeTicks()

const unread = ref(peekUnreadCount() ?? 0)

const visible = computed(() => {
  const role = profile.value?.role
  return role === 'admin' || role === 'collector'
})

const to = computed(() =>
  profile.value?.role === 'admin' ? '/admin/messages' : '/collector/messages',
)

const active = computed(() => {
  const path = route.path.replace(/\/$/, '')
  return path === to.value || path.startsWith(`${to.value}/`)
})

const badge = computed(() => formatUnreadBadge(unread.value))

async function loadUnread(force = false) {
  const role = profile.value?.role
  if (role !== 'admin' && role !== 'collector') {
    unread.value = 0
    return
  }
  try {
    unread.value = await fetchUnreadCount({ force })
  } catch {
    unread.value = peekUnreadCount() ?? 0
  }
}

onMounted(() => {
  void loadUnread()
})

watch(chatTick, () => {
  void loadUnread(true)
})

watch(() => profile.value?.role, () => {
  void loadUnread()
})

watch(
  () => peekUnreadCount(),
  (next) => {
    if (next != null) {
      unread.value = next
    }
  },
)
</script>

<template>
  <NuxtLink
    v-if="visible"
    :to="to"
    class="relative flex size-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-neutral-100 hover:text-foreground"
    :class="active ? 'bg-neutral-100 text-foreground' : ''"
    :aria-label="badge ? `Messages, ${unread} unread` : 'Messages'"
  >
    <MessageCircle
      class="size-5"
      :stroke-width="active ? 2.25 : 1.75"
    />
    <span
      v-if="badge"
      class="absolute -top-0.5 -right-0.5 min-w-4 rounded-full bg-foreground px-1 text-center text-[9px] font-bold leading-4 text-white"
    >
      {{ badge }}
    </span>
  </NuxtLink>
</template>
