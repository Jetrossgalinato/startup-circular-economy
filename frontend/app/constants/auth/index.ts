import type { RoleOption, UserRole } from '@/types/auth'

export const AUTH_STATE_KEYS = {
  user: 'auth-user',
  session: 'auth-session',
  profile: 'auth-profile',
  initialized: 'auth-initialized',
} as const

export const MIN_PASSWORD_LENGTH = 6

export const AUTH_INPUT_CLASS = 'h-10 rounded-xl border-neutral-200 bg-white sm:h-12'

export const AUTH_SELECT_TRIGGER_CLASS = 'h-10 rounded-xl border-neutral-200 bg-white sm:h-12'

export const REGISTER_ROLES: RoleOption[] = [
  { value: 'resident', label: 'Resident' },
  { value: 'admin', label: 'Admin' },
  { value: 'collector', label: 'Collector' },
]

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  resident: '/resident',
  collector: '/collector',
}

export const LOGOUT_REDIRECT_PATH = '/auth/login'

export const LOGIN_PATH = '/auth/login'

export const AUTH_MESSAGES = {
  register: {
    fullNameRequired: 'Full name is required.',
    emailRequired: 'Email is required.',
    roleRequired: 'Select a role to continue.',
    passwordMinLength: 'Password must be at least 6 characters.',
    passwordMismatch: 'Passwords do not match.',
    successTitle: 'Account created',
    success: 'Your account is ready. Redirecting to your dashboard.',
    successEmailConfirmationTitle: 'Confirm your email',
    successEmailConfirmation: 'Check your email to confirm your account, then sign in.',
    errorTitle: 'Sign up failed',
    genericError: 'Unable to create account.',
    validationTitle: 'Check your details',
    submitting: 'Creating account...',
    submit: 'Sign Up',
  },
  login: {
    credentialsRequired: 'Email and password are required.',
    errorTitle: 'Sign in failed',
    genericError: 'Unable to sign in.',
    successTitle: 'Signed in',
    success: 'Welcome back. Redirecting to your dashboard.',
    validationTitle: 'Check your details',
    submitting: 'Signing in...',
    submit: 'Login',
  },
  logout: {
    successTitle: 'Logged out',
    success: 'You have been signed out successfully.',
    errorTitle: 'Logout failed',
    genericError: 'Unable to log out.',
  },
} as const
