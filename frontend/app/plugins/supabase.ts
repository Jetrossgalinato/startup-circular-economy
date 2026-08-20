import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    if (import.meta.dev) {
      console.warn(
        '[supabase] Missing NUXT_PUBLIC_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_KEY. Restart the dev server after updating .env.local.',
      )
    }

    return {
      provide: {
        supabase: null as SupabaseClient | null,
      },
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  return {
    provide: {
      supabase,
    },
  }
})

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient | null
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: SupabaseClient | null
  }
}
