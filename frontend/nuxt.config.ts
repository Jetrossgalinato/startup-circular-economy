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
      path: '~/components',
      extensions: ['.vue'],
    },
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
