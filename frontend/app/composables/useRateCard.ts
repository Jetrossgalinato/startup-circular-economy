import type { RateCardCategory } from '@/types/listings'

export function useRateCard() {
  const supabase = useSupabase()

  async function fetchCategories(): Promise<RateCardCategory[]> {
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

  async function fetchCategory(code: string): Promise<RateCardCategory | null> {
    const { data, error } = await supabase
      .from('rate_card_categories')
      .select('code, name, examples, rate_per_kg, notes, active, sort_order')
      .eq('code', code)
      .eq('active', true)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    return {
      ...data,
      rate_per_kg: Number(data.rate_per_kg),
    }
  }

  return {
    fetchCategories,
    fetchCategory,
  }
}
