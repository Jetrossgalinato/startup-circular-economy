import { getRoleHomeRoute } from '@/utils/auth'
import type { UserRole } from '@/types/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { profile, fetchProfile, user } = useAuth()
  const requiredRole = to.meta.role as UserRole | undefined

  if (!requiredRole) {
    return
  }

  if (!profile.value && user.value) {
    await fetchProfile(user.value)
  }

  if (!profile.value?.role) {
    return
  }

  if (profile.value.role !== requiredRole) {
    return navigateTo(getRoleHomeRoute(profile.value.role))
  }
})
