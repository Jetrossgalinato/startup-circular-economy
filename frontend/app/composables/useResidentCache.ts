import { RESIDENT_CACHE_KEYS } from '@/constants/resident/cache'

export type ResidentCacheEntry<T> = {
  data: T
  fetchedAt: number
}

type CacheStore = Record<string, ResidentCacheEntry<unknown>>
type PendingStore = Record<string, Promise<unknown>>

export function useResidentCache() {
  const store = useState<CacheStore>(RESIDENT_CACHE_KEYS.store, () => ({}))
  const pending = useState<PendingStore>(RESIDENT_CACHE_KEYS.pending, () => ({}))

  function getCached<T>(key: string): ResidentCacheEntry<T> | null {
    const entry = store.value[key]
    return (entry as ResidentCacheEntry<T> | undefined) ?? null
  }

  function setCached<T>(key: string, data: T): ResidentCacheEntry<T> {
    const entry: ResidentCacheEntry<T> = {
      data,
      fetchedAt: Date.now(),
    }
    store.value = {
      ...store.value,
      [key]: entry as ResidentCacheEntry<unknown>,
    }
    return entry
  }

  function isStale(key: string, ttlMs: number): boolean {
    const entry = store.value[key]
    if (!entry) {
      return true
    }
    return Date.now() - entry.fetchedAt > ttlMs
  }

  function invalidate(keyOrPrefix: string) {
    const next: CacheStore = { ...store.value }
    const nextPending: PendingStore = { ...pending.value }

    if (keyOrPrefix.endsWith(':')) {
      for (const key of Object.keys(next)) {
        if (key.startsWith(keyOrPrefix)) {
          delete next[key]
          delete nextPending[key]
        }
      }
    } else if (keyOrPrefix in next || keyOrPrefix in nextPending) {
      delete next[keyOrPrefix]
      delete nextPending[keyOrPrefix]
    }

    store.value = next
    pending.value = nextPending
  }

  function invalidateAll() {
    store.value = {}
    pending.value = {}
  }

  /**
   * Stale-while-revalidate: return cached data immediately when present;
   * refresh in background when stale (or when force). Cold miss awaits network.
   */
  async function swr<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>,
    options: { force?: boolean } = {},
  ): Promise<T> {
    const cached = getCached<T>(key)
    const force = options.force === true
    const stale = !cached || isStale(key, ttlMs)

    async function runFetch(): Promise<T> {
      const existing = pending.value[key] as Promise<T> | undefined
      if (existing) {
        return existing
      }

      const request = fetcher()
        .then((data) => {
          setCached(key, data)
          return data
        })
        .finally(() => {
          const { [key]: _, ...rest } = pending.value
          pending.value = rest
        })

      pending.value = {
        ...pending.value,
        [key]: request,
      }

      return request
    }

    if (cached && !force) {
      if (stale) {
        void runFetch().catch(() => {
          // Keep serving stale cache on background refresh failure
        })
      }
      return cached.data
    }

    return runFetch()
  }

  return {
    getCached,
    setCached,
    isStale,
    invalidate,
    invalidateAll,
    swr,
    store,
  }
}
