import { getRoleHomeRoute } from '@/utils/auth'

export default defineNuxtRouteMiddleware(async () => {
  const { session, profile, fetchProfile, user } = useAuth()

  if (!session.value) {
    return
  }

  if (!profile.value && user.value) {
    await fetchProfile(user.value)
  }

  if (profile.value?.role) {
    return navigateTo(getRoleHomeRoute(profile.value.role))
  }
})
