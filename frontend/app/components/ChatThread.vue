<script setup lang="ts">
import { Send } from '@lucide/vue'
import type { ChatMessage } from '@/types/chat'
import { MAX_CHAT_BODY_LENGTH } from '@/constants/chat'
import { formatChatTime } from '@/utils/chat'

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

function labelFor(message: ChatMessage) {
  if (message.sender_id === props.currentUserId) {
    return null
  }
  if (props.viewerRole === 'collector') {
    return 'Admin'
  }
  if (message.sender_id === message.collector_id) {
    return props.collectorName || 'Collector'
  }
  return message.sender?.full_name || 'Admin'
}

function isOwn(message: ChatMessage) {
  return message.sender_id === props.currentUserId
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
      class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
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
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="isOwn(message) ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-2xl px-3.5 py-2"
          :class="isOwn(message)
            ? 'bg-foreground text-white'
            : 'border border-neutral-200 bg-neutral-50 text-foreground'"
        >
          <p
            v-if="labelFor(message)"
            class="text-[10px] font-semibold tracking-wide uppercase opacity-70"
          >
            {{ labelFor(message) }}
          </p>
          <p class="whitespace-pre-wrap text-sm leading-5">
            {{ message.body }}
          </p>
          <p
            class="mt-1 text-[10px]"
            :class="isOwn(message) ? 'text-white/70' : 'text-muted-foreground'"
          >
            {{ formatChatTime(message.created_at) }}
          </p>
        </div>
      </div>
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
