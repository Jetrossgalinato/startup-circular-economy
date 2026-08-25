<script setup lang="ts">
import type { ChatConversation } from '@/types/chat'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { fetchInbox, peekInbox } = useChat()
const { chatTick } = useRealtimeTicks()

const conversations = ref<ChatConversation[]>(peekInbox() ?? [])
const loading = ref(peekInbox() === null)

async function load(force = false) {
  const hadCache = peekInbox() !== null
  if (!hadCache) {
    loading.value = true
  }
  try {
    conversations.value = await fetchInbox({ force })
  } catch {
    if (!hadCache) {
      conversations.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

watch(chatTick, () => {
  void load(true)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Messages
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Shared inbox. Every admin sees the same collector threads.
    </p>
    <AdminChatInbox
      :conversations="conversations"
      :loading="loading"
    />
  </div>
</template>
