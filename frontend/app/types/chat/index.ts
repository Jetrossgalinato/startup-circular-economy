import type { UserRole } from '@/types/auth'

export type ChatProfileRef = {
  id: string
  full_name: string
  role?: UserRole
}

export type ChatConversation = {
  id: string
  collector_id: string
  last_message_at: string | null
  last_message_body: string | null
  last_sender_id: string | null
  admin_last_read_at: string | null
  collector_last_read_at: string | null
  created_at: string
  collector: ChatProfileRef | null
}

export type ChatMessage = {
  id: string
  conversation_id: string
  collector_id: string
  sender_id: string
  body: string
  created_at: string
  sender: ChatProfileRef | null
}
