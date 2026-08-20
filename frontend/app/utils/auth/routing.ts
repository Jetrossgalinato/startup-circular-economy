import { ROLE_HOME_ROUTES } from '@/constants/auth'
import type { UserRole } from '@/types/auth'

export function getRoleHomeRoute(role: UserRole): string {
  const route = ROLE_HOME_ROUTES[role]

  if (!route) {
    throw new Error(`Unknown role: ${role}`)
  }

  return route
}
