import type { UserRole } from '@/types/auth'

declare module '#app' {
  interface PageMeta {
    role?: UserRole
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    role?: UserRole
  }
}

export {}
