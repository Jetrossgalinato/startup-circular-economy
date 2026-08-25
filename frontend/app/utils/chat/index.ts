import type { ChatConversation } from '@/types/chat'

export function isAdminThreadUnread(conversation: ChatConversation): boolean {
  if (!conversation.last_message_at) {
    return false
  }
  if (!conversation.admin_last_read_at) {
    return true
  }
  return conversation.last_message_at > conversation.admin_last_read_at
}

export function formatChatTime(iso: string | null | undefined): string {
  if (!iso) {
    return ''
  }
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) {
    return new Intl.DateTimeFormat('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function previewMessage(body: string | null | undefined, max = 80): string {
  if (!body) {
    return ''
  }
  const trimmed = body.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= max) {
    return trimmed
  }
  return `${trimmed.slice(0, Math.max(0, max - 1))}…`
}

export function formatUnreadBadge(count: number): string | null {
  if (count <= 0) {
    return null
  }
  return count > 9 ? '9+' : String(count)
}
