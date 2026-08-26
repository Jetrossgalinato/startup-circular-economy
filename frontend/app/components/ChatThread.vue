<script setup lang="ts">
import { Send } from '@lucide/vue'
import type { ChatMessage } from '@/types/chat'
import { MAX_CHAT_BODY_LENGTH } from '@/constants/chat'
import { formatChatTime, ownMessageStatus } from '@/utils/chat'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
} from '@/components/ui/bubble'
import { Marker, MarkerContent } from '@/components/ui/marker'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from '@/components/ui/message'

const props = withDefaults(defineProps<{
  messages: ChatMessage[]
  currentUserId: string
  viewerRole: 'admin' | 'collector'
  collectorName?: string
  loading?: boolean
  sending?: boolean
  typingLines?: string[]
  otherLastReadAt?: string | null
  chatmateOnline?: boolean
  emptyTitle: string
  emptyDescription: string
}>(), {
  collectorName: '',
  loading: false,
  sending: false,
  typingLines: () => [],
  otherLastReadAt: null,
  chatmateOnline: false,
})

const emit = defineEmits<{
  send: [body: string]
  typing: []
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

function firstItem(cluster: MessageCluster) {
  return cluster.items[0]
}

function lastItem(cluster: MessageCluster) {
  return cluster.items[cluster.items.length - 1] ?? cluster.items[0]
}

function initialsForCluster(cluster: MessageCluster) {
  const message = firstItem(cluster)
  return message ? initialsFor(message) : '?'
}

const lastOwnClusterId = computed(() => {
  for (let index = clusters.value.length - 1; index >= 0; index -= 1) {
    const cluster = clusters.value[index]
    if (cluster?.own) {
      return cluster.id
    }
  }
  return null
})

function footerStatus(cluster: MessageCluster) {
  if (!cluster.own || cluster.id !== lastOwnClusterId.value) {
    return null
  }
  const message = lastItem(cluster)
  return ownMessageStatus({
    createdAt: message?.created_at,
    otherLastReadAt: props.otherLastReadAt,
    chatmateOnline: props.chatmateOnline,
  })
}

async function scrollToBottom() {
  await nextTick()
  bottomRef.value?.scrollIntoView({ block: 'end' })
}

watch(
  () => [props.messages.length, props.typingLines.length] as const,
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

function onInput() {
  if (!draft.value.trim() || props.sending) {
    return
  }
  emit('typing')
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
      class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1"
    >
      <Marker
        v-if="loading && messages.length === 0"
        role="status"
      >
        <MarkerContent>
          Loading messages…
        </MarkerContent>
      </Marker>

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

      <Message
        v-for="cluster in clusters"
        :key="cluster.id"
        :align="cluster.own ? 'end' : 'start'"
      >
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>{{ initialsForCluster(cluster) }}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <BubbleGroup v-if="cluster.items.length > 1">
            <Bubble
              v-for="message in cluster.items"
              :key="message.id"
              :variant="cluster.own ? 'default' : 'muted'"
            >
              <BubbleContent class="whitespace-pre-wrap">
                {{ message.body }}
              </BubbleContent>
            </Bubble>
          </BubbleGroup>
          <Bubble
            v-else
            :variant="cluster.own ? 'default' : 'muted'"
          >
            <BubbleContent class="whitespace-pre-wrap">
              {{ lastItem(cluster)?.body }}
            </BubbleContent>
          </Bubble>
          <MessageFooter
            :class="cluster.own && cluster.id === lastOwnClusterId ? 'gap-1 text-neutral-500' : ''"
          >
            <span>{{ formatChatTime(lastItem(cluster)?.created_at) }}</span>
            <template v-if="footerStatus(cluster)">
              <span aria-hidden="true">·</span>
              <span>{{ footerStatus(cluster) }}</span>
            </template>
          </MessageFooter>
        </MessageContent>
      </Message>

      <Marker
        v-for="label in typingLines"
        :key="label"
        role="status"
        class="text-neutral-500"
      >
        <MarkerContent class="text-neutral-500">
          <span class="font-medium">{{ label }}</span> is typing...
        </MarkerContent>
      </Marker>

      <Marker
        v-if="sending"
        role="status"
      >
        <MarkerContent>
          Sending…
        </MarkerContent>
      </Marker>

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
        @input="onInput"
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
