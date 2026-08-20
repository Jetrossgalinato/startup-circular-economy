import type { SupabaseClient } from '@supabase/supabase-js'

export function useSupabase(): SupabaseClient {
  const supabase = useNuxtApp().$supabase

  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_KEY in .env.local, then restart nuxt.',
    )
  }

  return supabase
}
