import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  pages: {
    pattern: ['**/*.vue', '!**/components/**'],
  },
  components: [
    {
      path: '~/components/ui',
      extensions: ['.vue'],
      pathPrefix: false,
    },
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
