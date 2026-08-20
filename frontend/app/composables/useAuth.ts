import type { Session, User } from '@supabase/supabase-js'

export type UserRole = 'resident' | 'admin' | 'collector'

export type Profile = {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}

type SignUpInput = {
  email: string
  password: string
  fullName: string
  role: UserRole
}

type SignInInput = {
  email: string
  password: string
}

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }

  if (normalized.includes('user already registered')) {
    return 'An account with this email already exists.'
  }

  if (normalized.includes('password should be at least')) {
    return 'Password must be at least 6 characters.'
  }

  if (normalized.includes('unable to validate email address')) {
    return 'Enter a valid email address.'
  }

  return message
}

export function useAuth() {
  const supabase = useSupabase()
  const user = useState<User | null>('auth-user', () => null)
  const session = useState<Session | null>('auth-session', () => null)
  const profile = useState<Profile | null>('auth-profile', () => null)
  const initialized = useState('auth-initialized', () => false)

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

  return {
    user,
    session,
    profile,
    initAuth,
    fetchProfile,
    signUp,
    signIn,
    signOut,
  }
}
