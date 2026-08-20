export function mapAuthError(message: string): string {
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
