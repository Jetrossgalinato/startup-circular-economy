import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

const env = loadEnv('', '.', '')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    cursorApiKey: env.CURSOR_API_KEY || '',
    public: {
      supabaseUrl: env.NUXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '',
      supabaseKey: env.NUXT_PUBLIC_SUPABASE_KEY || env.SUPABASE_KEY || '',
    },
  },
  css: ['~/assets/css/tailwind.css'],
  pages: {
    pattern: ['**/*.vue', '!**/components/**'],
  },
  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
      pathPrefix: false,
      ignore: ['**/ui/**'],
    },
    {
      path: '~/components/ui',
      extensions: ['.vue'],
      pathPrefix: false,
    },
    {
      path: '~/pages/auth/components',
      extensions: ['.vue'],
      pathPrefix: false,
    },
    {
      path: '~/pages/resident/components',
      extensions: ['.vue'],
      pathPrefix: false,
    },
    {
      path: '~/pages/admin/components',
      extensions: ['.vue'],
      pathPrefix: false,
    },
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: ['node'],
        },
      },
    },
  },
})
