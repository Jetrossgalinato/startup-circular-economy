import { LOGIN_PATH } from '@/constants/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Session lives in the browser (localStorage). Skip the check during SSR so a
  // refresh of a protected page is not treated as logged-out.
  if (import.meta.server) {
    return
  }

  const { session, initAuth } = useAuth()
  await initAuth()

  if (!session.value) {
    return navigateTo({
      path: LOGIN_PATH,
      query: to.fullPath !== LOGIN_PATH ? { redirect: to.fullPath } : undefined,
    })
  }
})
