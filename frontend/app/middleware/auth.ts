export default defineNuxtRouteMiddleware(() => {
  const { session } = useAuth()

  if (session.value) {
    return navigateTo('/')
  }
})
