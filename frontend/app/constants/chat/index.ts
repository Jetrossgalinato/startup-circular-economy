export const MAX_CHAT_BODY_LENGTH = 2000

export const CHAT_CACHE_KEYS = {
  inbox: 'chat-inbox',
  unread: 'chat-unread',
  ownConversation: 'chat-own-conversation',
  thread: (id: string) => `chat-thread:${id}`,
  threadPrefix: 'chat-thread:',
} as const

export const CHAT_CACHE_TTL_MS = {
  inbox: 15 * 1000,
  unread: 10 * 1000,
  ownConversation: 15 * 1000,
  thread: 10 * 1000,
} as const

export type ChatCacheFetchOptions = {
  force?: boolean
}
