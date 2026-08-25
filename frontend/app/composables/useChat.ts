import type { ChatConversation, ChatMessage, ChatProfileRef } from '@/types/chat'
import {
  CHAT_CACHE_KEYS,
  CHAT_CACHE_TTL_MS,
  MAX_CHAT_BODY_LENGTH,
  type ChatCacheFetchOptions,
} from '@/constants/chat'
import { isAdminThreadUnread } from '@/utils/chat'

const CONVERSATION_COLUMNS = `
  id,
  collector_id,
  last_message_at,
  last_message_body,
  last_sender_id,
  admin_last_read_at,
  collector_last_read_at,
  created_at,
  collector:profiles!collector_id ( id, full_name )
`

const MESSAGE_COLUMNS = `
  id,
  conversation_id,
  collector_id,
  sender_id,
  body,
  created_at,
  sender:profiles!sender_id ( id, full_name, role )
`

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }
  return value ?? null
}

function normalizeProfile(value: unknown): ChatProfileRef | null {
  const row = asOne(value as ChatProfileRef | ChatProfileRef[] | null)
  if (!row?.id) {
    return null
  }
  return {
    id: row.id,
    full_name: row.full_name ?? '',
    role: row.role,
  }
}

function normalizeConversation(row: Record<string, unknown>): ChatConversation {
  return {
    id: row.id as string,
    collector_id: row.collector_id as string,
    last_message_at: (row.last_message_at as string | null) ?? null,
    last_message_body: (row.last_message_body as string | null) ?? null,
    last_sender_id: (row.last_sender_id as string | null) ?? null,
    admin_last_read_at: (row.admin_last_read_at as string | null) ?? null,
    collector_last_read_at: (row.collector_last_read_at as string | null) ?? null,
    created_at: row.created_at as string,
    collector: normalizeProfile(row.collector),
  }
}

function normalizeMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    conversation_id: row.conversation_id as string,
    collector_id: row.collector_id as string,
    sender_id: row.sender_id as string,
    body: row.body as string,
    created_at: row.created_at as string,
    sender: normalizeProfile(row.sender),
  }
}

function countAdminUnread(inbox: ChatConversation[]): number {
  return inbox.filter((conversation) => isAdminThreadUnread(conversation)).length
}

export function useChat() {
  const supabase = useSupabase()
  const cache = useResidentCache()
  const { user, profile } = useAuth()

  function peekInbox(): ChatConversation[] | null {
    return cache.getCached<ChatConversation[]>(CHAT_CACHE_KEYS.inbox)?.data ?? null
  }

  function peekOwnConversation(): ChatConversation | null | undefined {
    const cached = cache.getCached<ChatConversation | null>(CHAT_CACHE_KEYS.ownConversation)
    return cached ? cached.data : undefined
  }

  function peekThread(conversationId: string): ChatMessage[] | null {
    return cache.getCached<ChatMessage[]>(CHAT_CACHE_KEYS.thread(conversationId))?.data ?? null
  }

  function peekUnreadCount(): number | null {
    const cached = cache.getCached<number>(CHAT_CACHE_KEYS.unread)?.data
    if (cached != null) {
      return cached
    }
    if (profile.value?.role === 'admin') {
      const inbox = peekInbox()
      return inbox ? countAdminUnread(inbox) : null
    }
    return null
  }

  function writeConversationThrough(conversation: ChatConversation) {
    const inbox = peekInbox()
    if (inbox) {
      const without = inbox.filter((item) => item.id !== conversation.id)
      const merged = {
        ...conversation,
        collector: conversation.collector ?? inbox.find((item) => item.id === conversation.id)?.collector ?? null,
      }
      const next = [merged, ...without].sort((a, b) => {
        const aTime = a.last_message_at ?? a.created_at
        const bTime = b.last_message_at ?? b.created_at
        return bTime.localeCompare(aTime)
      })
      cache.setCached(CHAT_CACHE_KEYS.inbox, next)
      cache.setCached(CHAT_CACHE_KEYS.unread, countAdminUnread(next))
    }

    if (profile.value?.role === 'collector') {
      cache.setCached(CHAT_CACHE_KEYS.ownConversation, conversation)
    }
  }

  function appendThreadMessage(message: ChatMessage) {
    const key = CHAT_CACHE_KEYS.thread(message.conversation_id)
    const current = cache.getCached<ChatMessage[]>(key)?.data ?? []
    if (current.some((item) => item.id === message.id)) {
      return
    }
    cache.setCached(key, [...current, message])
  }

  async function fetchInboxFromNetwork(): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(CONVERSATION_COLUMNS)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row) => normalizeConversation(row as Record<string, unknown>))
  }

  async function fetchInbox(
    options: ChatCacheFetchOptions = {},
  ): Promise<ChatConversation[]> {
    const inbox = await cache.swr(
      CHAT_CACHE_KEYS.inbox,
      CHAT_CACHE_TTL_MS.inbox,
      () => fetchInboxFromNetwork(),
      options,
    )
    cache.setCached(CHAT_CACHE_KEYS.unread, countAdminUnread(inbox))
    return inbox
  }

  async function fetchOwnConversationFromNetwork(): Promise<ChatConversation | null> {
    if (!user.value) {
      return null
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(CONVERSATION_COLUMNS)
      .eq('collector_id', user.value.id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? normalizeConversation(data as Record<string, unknown>) : null
  }

  async function fetchOwnConversation(
    options: ChatCacheFetchOptions = {},
  ): Promise<ChatConversation | null> {
    return cache.swr(
      CHAT_CACHE_KEYS.ownConversation,
      CHAT_CACHE_TTL_MS.ownConversation,
      () => fetchOwnConversationFromNetwork(),
      options,
    )
  }

  async function fetchConversation(id: string): Promise<ChatConversation | null> {
    const inbox = peekInbox()
    const fromInbox = inbox?.find((item) => item.id === id)
    if (fromInbox) {
      return fromInbox
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(CONVERSATION_COLUMNS)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? normalizeConversation(data as Record<string, unknown>) : null
  }

  async function fetchThreadFromNetwork(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(MESSAGE_COLUMNS)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200)

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row) => normalizeMessage(row as Record<string, unknown>))
  }

  async function fetchThread(
    conversationId: string,
    options: ChatCacheFetchOptions = {},
  ): Promise<ChatMessage[]> {
    return cache.swr(
      CHAT_CACHE_KEYS.thread(conversationId),
      CHAT_CACHE_TTL_MS.thread,
      () => fetchThreadFromNetwork(conversationId),
      options,
    )
  }

  async function countCollectorUnread(conversation: ChatConversation): Promise<number> {
    if (!user.value) {
      return 0
    }

    let query = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversation.id)
      .neq('sender_id', user.value.id)

    if (conversation.collector_last_read_at) {
      query = query.gt('created_at', conversation.collector_last_read_at)
    }

    const { count, error } = await query
    if (error) {
      throw new Error(error.message)
    }

    return count ?? 0
  }

  async function fetchUnreadCountFromNetwork(): Promise<number> {
    const role = profile.value?.role
    if (role === 'admin') {
      return countAdminUnread(await fetchInbox({ force: true }))
    }
    if (role === 'collector') {
      const conversation = await fetchOwnConversation({ force: true })
      if (!conversation) {
        return 0
      }
      return countCollectorUnread(conversation)
    }
    return 0
  }

  async function fetchUnreadCount(
    options: ChatCacheFetchOptions = {},
  ): Promise<number> {
    if (profile.value?.role !== 'admin' && profile.value?.role !== 'collector') {
      return 0
    }

    return cache.swr(
      CHAT_CACHE_KEYS.unread,
      CHAT_CACHE_TTL_MS.unread,
      () => fetchUnreadCountFromNetwork(),
      options,
    )
  }

  async function ensureOwnConversation(): Promise<ChatConversation> {
    const existing = await fetchOwnConversation()
    if (existing) {
      return existing
    }
    if (!user.value) {
      throw new Error('You must be signed in to send a message.')
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ collector_id: user.value.id })
      .select(CONVERSATION_COLUMNS)
      .single()

    if (error) {
      if (error.code === '23505') {
        const again = await fetchOwnConversation({ force: true })
        if (again) {
          return again
        }
      }
      throw new Error(error.message)
    }

    const conversation = normalizeConversation(data as Record<string, unknown>)
    cache.setCached(CHAT_CACHE_KEYS.ownConversation, conversation)
    return conversation
  }

  async function sendMessage(body: string, conversationId?: string): Promise<ChatMessage> {
    const trimmed = body.trim()
    if (!trimmed) {
      throw new Error('Message cannot be empty.')
    }
    if (trimmed.length > MAX_CHAT_BODY_LENGTH) {
      throw new Error(`Message must be ${MAX_CHAT_BODY_LENGTH} characters or less.`)
    }
    if (!user.value) {
      throw new Error('You must be signed in to send a message.')
    }

    let targetId = conversationId
    if (!targetId) {
      if (profile.value?.role !== 'collector') {
        throw new Error('Conversation not found.')
      }
      targetId = (await ensureOwnConversation()).id
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: targetId,
        sender_id: user.value.id,
        body: trimmed,
      })
      .select(MESSAGE_COLUMNS)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const message = normalizeMessage(data as Record<string, unknown>)
    if (!message.sender && profile.value) {
      message.sender = {
        id: profile.value.id,
        full_name: profile.value.full_name,
        role: profile.value.role,
      }
    }
    appendThreadMessage(message)

    const now = message.created_at
    const existing = profile.value?.role === 'collector'
      ? (peekOwnConversation() ?? null)
      : peekInbox()?.find((item) => item.id === targetId) ?? null

    writeConversationThrough({
      id: targetId,
      collector_id: message.collector_id,
      last_message_at: now,
      last_message_body: message.body,
      last_sender_id: user.value.id,
      admin_last_read_at: profile.value?.role === 'admin' ? now : existing?.admin_last_read_at ?? null,
      collector_last_read_at: profile.value?.role === 'collector' ? now : existing?.collector_last_read_at ?? null,
      created_at: existing?.created_at ?? now,
      collector: existing?.collector ?? null,
    })

    if (profile.value?.role === 'collector') {
      cache.setCached(CHAT_CACHE_KEYS.unread, 0)
    }

    return message
  }

  async function markRead(conversationId: string): Promise<void> {
    const existing = peekInbox()?.find((item) => item.id === conversationId)
      ?? peekOwnConversation()
      ?? null
    if (existing) {
      const readAt = profile.value?.role === 'admin'
        ? existing.admin_last_read_at
        : existing.collector_last_read_at
      if (!existing.last_message_at || (readAt && readAt >= existing.last_message_at)) {
        return
      }
    }

    const { data, error } = await supabase.rpc('mark_chat_read', {
      p_conversation_id: conversationId,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data) {
      const next = normalizeConversation(data as Record<string, unknown>)
      const existing = peekInbox()?.find((item) => item.id === conversationId)
        ?? peekOwnConversation()
        ?? null
      writeConversationThrough({
        ...next,
        collector: next.collector ?? existing?.collector ?? null,
      })
    }

    if (profile.value?.role === 'collector') {
      cache.setCached(CHAT_CACHE_KEYS.unread, 0)
    } else if (profile.value?.role === 'admin') {
      const inbox = peekInbox()
      if (inbox) {
        cache.setCached(CHAT_CACHE_KEYS.unread, countAdminUnread(inbox))
      }
    }
  }

  return {
    fetchInbox,
    fetchOwnConversation,
    fetchConversation,
    fetchThread,
    fetchUnreadCount,
    sendMessage,
    markRead,
    peekInbox,
    peekOwnConversation,
    peekThread,
    peekUnreadCount,
  }
}
