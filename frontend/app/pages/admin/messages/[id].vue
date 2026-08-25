<script setup lang="ts">
import type { ChatConversation, ChatMessage } from '@/types/chat'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const route = useRoute()
const conversationId = computed(() => String(route.params.id))
const { user } = useAuth()
const {
  fetchConversation,
  fetchThread,
  peekThread,
  peekInbox,
  sendMessage,
  markRead,
} = useChat()
const { chatTick } = useRealtimeTicks()
const { typingLines, notifyTyping, stopTyping } = useChatTyping(conversationId)
const { isUserOnline } = useAppPresence()
const chatmateOnline = computed(() => isUserOnline(conversation.value?.collector_id))

const conversation = ref<ChatConversation | null>(
  peekInbox()?.find((item) => item.id === conversationId.value) ?? null,
)
const messages = ref<ChatMessage[]>(peekThread(conversationId.value) ?? [])
const loading = ref(messages.value.length === 0)
const sending = ref(false)

async function load(showError = true, force = false) {
  try {
    const nextConversation = await fetchConversation(conversationId.value)
    if (!nextConversation) {
      if (showError) {
        toast.error('Conversation not found', {
          description: 'It may have been removed.',
        })
        await navigateTo('/admin/messages')
      }
      return
    }
    conversation.value = nextConversation
    messages.value = await fetchThread(nextConversation.id, { force })
    await markRead(nextConversation.id)
  } catch (error) {
    if (showError) {
      toast.error('Could not load messages', {
        description: error instanceof Error ? error.message : 'Try again later.',
      })
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

watch(chatTick, () => {
  void load(false, true)
})

watch(conversationId, () => {
  loading.value = true
  void load()
})

async function onSend(body: string) {
  sending.value = true
  try {
    await stopTyping()
    await sendMessage(body, conversationId.value)
    await load(false, true)
  } catch (error) {
    toast.error('Could not send message', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="flex h-[calc(100dvh-13rem)] flex-col overflow-hidden">
    <NuxtLink
      to="/admin/messages"
      class="shrink-0 text-sm text-muted-foreground underline underline-offset-2"
    >
      ← All messages
    </NuxtLink>
    <h1 class="mt-3 shrink-0 text-3xl font-bold tracking-tight">
      {{ conversation?.collector?.full_name || 'Collector' }}
    </h1>
    <p class="mt-1.5 mb-4 shrink-0 text-sm text-muted-foreground">
      Shared admin inbox
    </p>
    <ChatThread
      :messages="messages"
      :current-user-id="user?.id ?? ''"
      viewer-role="admin"
      :collector-name="conversation?.collector?.full_name || ''"
      :loading="loading"
      :sending="sending"
      :typing-lines="typingLines"
      :other-last-read-at="conversation?.collector_last_read_at"
      :chatmate-online="chatmateOnline"
      empty-title="No messages yet"
      empty-description="Reply when this collector writes in."
      @send="onSend"
      @typing="notifyTyping"
    />
  </div>
</template>
