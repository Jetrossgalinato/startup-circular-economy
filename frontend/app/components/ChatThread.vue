<script setup lang="ts">
import { Send } from '@lucide/vue'
import type { ChatMessage } from '@/types/chat'
import { MAX_CHAT_BODY_LENGTH } from '@/constants/chat'
import { formatChatTime } from '@/utils/chat'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from '@/components/ui/message'

const props = withDefaults(defineProps<{
  messages: ChatMessage[]
  currentUserId: string
  viewerRole: 'admin' | 'collector'
  collectorName?: string
  loading?: boolean
  sending?: boolean
  emptyTitle: string
  emptyDescription: string
}>(), {
  collectorName: '',
  loading: false,
  sending: false,
})

const emit = defineEmits<{
  send: [body: string]
}>()

const draft = ref('')
const listRef = ref<HTMLElement | null>(null)
const bottomRef = ref<HTMLElement | null>(null)

const canSend = computed(() => {
  const trimmed = draft.value.trim()
  return trimmed.length > 0 && trimmed.length <= MAX_CHAT_BODY_LENGTH && !props.sending
})

type MessageCluster = {
  id: string
  senderId: string
  own: boolean
  items: ChatMessage[]
}

const clusters = computed((): MessageCluster[] => {
  const next: MessageCluster[] = []
  for (const message of props.messages) {
    const own = message.sender_id === props.currentUserId
    const last = next[next.length - 1]
    if (last && last.senderId === message.sender_id) {
      last.items.push(message)
    }
    else {
      next.push({
        id: message.id,
        senderId: message.sender_id,
        own,
        items: [message],
      })
    }
  }
  return next
})

function labelFor(message: ChatMessage) {
  if (message.sender_id === props.currentUserId) {
    return 'You'
  }
  if (props.viewerRole === 'collector') {
    return 'Admin'
  }
  if (message.sender_id === message.collector_id) {
    return props.collectorName || 'Collector'
  }
  return message.sender?.full_name || 'Admin'
}

function initialsFor(message: ChatMessage) {
  const name = labelFor(message)
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  if (!first) {
    return '?'
  }
  const last = parts[parts.length - 1] ?? first
  const letters = parts.length === 1
    ? first.slice(0, 2)
    : `${first.charAt(0)}${last.charAt(0)}`
  return letters.toUpperCase()
}

async function scrollToBottom() {
  await nextTick()
  bottomRef.value?.scrollIntoView({ block: 'end' })
}

watch(
  () => props.messages.length,
  () => {
    void scrollToBottom()
  },
)

onMounted(() => {
  void scrollToBottom()
})

function submit() {
  const trimmed = draft.value.trim()
  if (!trimmed || trimmed.length > MAX_CHAT_BODY_LENGTH || props.sending) {
    return
  }
  emit('send', trimmed)
  draft.value = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    submit()
  }
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div
      ref="listRef"
      class="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
    >
      <p
        v-if="loading && messages.length === 0"
        class="py-8 text-center text-sm text-muted-foreground"
      >
        Loading messages…
      </p>
      <div
        v-else-if="messages.length === 0"
        class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
      >
        <p class="font-medium">
          {{ emptyTitle }}
        </p>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ emptyDescription }}
        </p>
      </div>
      <MessageGroup
        v-for="cluster in clusters"
        :key="cluster.id"
      >
        <Message
          v-for="(message, index) in cluster.items"
          :key="message.id"
          :align="cluster.own ? 'end' : 'start'"
        >
          <MessageAvatar
            v-if="index === cluster.items.length - 1"
            class="size-8 text-[10px] font-semibold tracking-wide text-muted-foreground"
          >
            {{ initialsFor(message) }}
          </MessageAvatar>
          <MessageAvatar
            v-else
            class="size-8 bg-transparent"
          />
          <MessageContent class="w-auto max-w-[85%]">
            <MessageHeader
              v-if="index === 0"
              :class="cluster.own ? 'justify-end' : ''"
            >
              {{ labelFor(message) }}
            </MessageHeader>
            <div
              class="rounded-2xl px-3.5 py-2 text-sm leading-5 whitespace-pre-wrap"
              :class="cluster.own
                ? 'bg-foreground text-white'
                : 'border border-neutral-200 bg-muted text-foreground'"
            >
              {{ message.body }}
            </div>
            <MessageFooter>
              {{ formatChatTime(message.created_at) }}
            </MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
      <div ref="bottomRef" />
    </div>

    <form
      class="mt-3 flex shrink-0 items-end gap-2 border-t border-neutral-200 bg-white pt-3 pb-4 pl-2"
      @submit.prevent="submit"
    >
      <textarea
        v-model="draft"
        rows="1"
        :maxlength="MAX_CHAT_BODY_LENGTH"
        :disabled="sending"
        class="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        placeholder="Type a message"
        @keydown="onKeydown"
      />
      <Button
        type="submit"
        size="icon"
        class="size-10 shrink-0 rounded-full bg-foreground text-white hover:bg-foreground/90"
        :disabled="!canSend"
        aria-label="Send"
      >
        <Send class="size-4" />
      </Button>
    </form>
  </div>
</template>
