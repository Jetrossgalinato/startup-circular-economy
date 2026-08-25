<script setup lang="ts">
import type { ChatConversation } from '@/types/chat'
import { formatChatTime, isAdminThreadUnread, previewMessage } from '@/utils/chat'

defineProps<{
  conversations: ChatConversation[]
  loading?: boolean
}>()
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="loading && conversations.length === 0"
      class="text-sm text-muted-foreground"
    >
      Loading messages…
    </div>
    <div
      v-else-if="conversations.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">
        No messages yet
      </p>
      <p class="mt-1 text-sm text-muted-foreground">
        Collectors can reach you from the chat icon.
      </p>
    </div>
    <NuxtLink
      v-for="conversation in conversations"
      :key="conversation.id"
      :to="`/admin/messages/${conversation.id}`"
      class="block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm font-semibold">
            {{ conversation.collector?.full_name || 'Collector' }}
          </p>
          <p class="mt-0.5 truncate text-sm text-muted-foreground">
            {{ previewMessage(conversation.last_message_body) || 'No messages yet' }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span class="text-[11px] text-muted-foreground">
            {{ formatChatTime(conversation.last_message_at) }}
          </span>
          <span
            v-if="isAdminThreadUnread(conversation)"
            class="size-2 rounded-full bg-[#e07070]"
            aria-label="Unread"
          />
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
