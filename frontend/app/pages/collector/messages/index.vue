<script setup lang="ts">
import type { ChatConversation, ChatMessage } from '@/types/chat'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const { user } = useAuth()
const {
  fetchOwnConversation,
  peekOwnConversation,
  fetchThread,
  peekThread,
  sendMessage,
  markRead,
} = useChat()
const { chatTick } = useRealtimeTicks()

const conversation = ref<ChatConversation | null>(peekOwnConversation() ?? null)
const messages = ref<ChatMessage[]>(
  conversation.value ? (peekThread(conversation.value.id) ?? []) : [],
)
const loading = ref(!conversation.value || peekThread(conversation.value.id) === null)
const sending = ref(false)
const conversationId = computed(() => conversation.value?.id ?? null)
const { typingLines, notifyTyping, stopTyping } = useChatTyping(conversationId)

async function load(force = false) {
  try {
    const nextConversation = await fetchOwnConversation({ force })
    conversation.value = nextConversation
    if (!nextConversation) {
      messages.value = []
      return
    }
    messages.value = await fetchThread(nextConversation.id, { force })
    await markRead(nextConversation.id)
  } catch (error) {
    if (!conversation.value) {
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
  void load(true)
})

async function onSend(body: string) {
  sending.value = true
  try {
    await stopTyping()
    await sendMessage(body, conversation.value?.id)
    await load(true)
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
    <h1 class="shrink-0 text-3xl font-bold tracking-tight">
      Admin
    </h1>
    <p class="mt-1.5 mb-4 shrink-0 text-sm text-muted-foreground">
      Cross-dock. All staff share this inbox.
    </p>
    <ChatThread
      :messages="messages"
      :current-user-id="user?.id ?? ''"
      viewer-role="collector"
      :loading="loading"
      :sending="sending"
      :typing-lines="typingLines"
      empty-title="No messages yet"
      empty-description="Message the cross-dock about a claim, pickup, or delivery."
      @send="onSend"
      @typing="notifyTyping"
    />
  </div>
</template>
