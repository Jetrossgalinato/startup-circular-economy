import { LOGIN_PATH } from '@/constants/auth'

export default defineNuxtRouteMiddleware(() => {
  const { session } = useAuth()

  if (!session.value) {
    return navigateTo(LOGIN_PATH)
  }
})
