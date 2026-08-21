import type { RateCardCategory } from '@/types/listings'
import { RESIDENT_CACHE_KEYS, RESIDENT_CACHE_TTL_MS, type ResidentCacheFetchOptions } from '@/constants/resident/cache'

export function useRateCard() {
  const supabase = useSupabase()
  const cache = useResidentCache()

  async function fetchCategoriesFromNetwork(): Promise<RateCardCategory[]> {
    const { data, error } = await supabase
      .from('rate_card_categories')
      .select('code, name, examples, rate_per_kg, notes, active, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row) => ({
      ...row,
      rate_per_kg: Number(row.rate_per_kg),
    }))
  }

  async function fetchCategories(
    options: ResidentCacheFetchOptions = {},
  ): Promise<RateCardCategory[]> {
    return cache.swr(
      RESIDENT_CACHE_KEYS.rateCard,
      RESIDENT_CACHE_TTL_MS.rateCard,
      fetchCategoriesFromNetwork,
      options,
    )
  }

  async function fetchCategory(code: string): Promise<RateCardCategory | null> {
    const categories = await fetchCategories()
    return categories.find((category) => category.code === code) ?? null
  }

  function peekCategories(): RateCardCategory[] | null {
    return cache.getCached<RateCardCategory[]>(RESIDENT_CACHE_KEYS.rateCard)?.data ?? null
  }

  return {
    fetchCategories,
    fetchCategory,
    peekCategories,
  }
}
