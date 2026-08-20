export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['supabase'],
  async setup() {
    if (!useNuxtApp().$supabase) {
      return
    }

    const { initAuth } = useAuth()
    await initAuth()
  },
})
