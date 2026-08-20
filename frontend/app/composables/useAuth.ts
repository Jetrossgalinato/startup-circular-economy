import type { Session, User } from '@supabase/supabase-js'
import { AUTH_STATE_KEYS } from '@/constants/auth'
import type { Profile, SignInInput, SignUpInput } from '@/types/auth'
import { getRoleHomeRoute, mapAuthError } from '@/utils/auth'

export function useAuth() {
  const supabase = useSupabase()
  const user = useState<User | null>(AUTH_STATE_KEYS.user, () => null)
  const session = useState<Session | null>(AUTH_STATE_KEYS.session, () => null)
  const profile = useState<Profile | null>(AUTH_STATE_KEYS.profile, () => null)
  const initialized = useState<boolean>(AUTH_STATE_KEYS.initialized, () => false)

  async function fetchProfile(currentUser: User | null = user.value) {
    if (!currentUser) {
      profile.value = null
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    profile.value = data
    return data
  }

  async function setSession(nextSession: Session | null) {
    session.value = nextSession
    user.value = nextSession?.user ?? null

    if (nextSession?.user) {
      await fetchProfile(nextSession.user)
    } else {
      profile.value = null
    }
  }

  async function initAuth() {
    if (initialized.value) {
      return
    }

    initialized.value = true

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    await setSession(data.session)

    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      await setSession(nextSession)
    })
  }

  async function signUp({ email, password, fullName, role }: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      throw new Error(mapAuthError(error.message))
    }

    await setSession(data.session)
    return data
  }

  async function signIn({ email, password }: SignInInput) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(mapAuthError(error.message))
    }

    await setSession(data.session)
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(mapAuthError(error.message))
    }

    await setSession(null)
  }

  async function redirectToRoleHome() {
    const role = profile.value?.role

    if (!role) {
      throw new Error('Profile role is not available')
    }

    await navigateTo(getRoleHomeRoute(role))
  }

  return {
    user,
    session,
    profile,
    initAuth,
    fetchProfile,
    signUp,
    signIn,
    signOut,
    redirectToRoleHome,
  }
}
