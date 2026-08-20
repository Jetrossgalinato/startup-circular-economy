import { AUTH_MESSAGES, MIN_PASSWORD_LENGTH } from '@/constants/auth'
import type { LoginFormValues, RegisterFormValues } from '@/types/auth'

export function validateRegisterForm(values: RegisterFormValues): string | null {
  if (!values.fullName.trim()) {
    return AUTH_MESSAGES.register.fullNameRequired
  }

  if (!values.email.trim()) {
    return AUTH_MESSAGES.register.emailRequired
  }

  if (!values.role) {
    return AUTH_MESSAGES.register.roleRequired
  }

  if (values.password.length < MIN_PASSWORD_LENGTH) {
    return AUTH_MESSAGES.register.passwordMinLength
  }

  if (values.password !== values.confirmPassword) {
    return AUTH_MESSAGES.register.passwordMismatch
  }

  return null
}

export function validateLoginForm(values: LoginFormValues): string | null {
  if (!values.email.trim() || !values.password) {
    return AUTH_MESSAGES.login.credentialsRequired
  }

  return null
}
