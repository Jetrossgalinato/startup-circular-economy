import type { Component } from 'vue'
import {
  ClipboardList,
  Home,
  Package,
  PlusCircle,
  Scale,
  Store,
  UserRound,
  Warehouse,
} from '@lucide/vue'
import type { UserRole } from '@/types/auth'

export type InsideNavItem = {
  label: string
  to: string
  icon: Component
  match?: (path: string) => boolean
  badge?: 'claims'
}

export const ROLE_NAV_ITEMS: Record<UserRole, InsideNavItem[]> = {
  resident: [
    {
      label: 'Home',
      to: '/resident',
      icon: Home,
      match: (path) => path === '/resident' || path === '/resident/',
    },
    {
      label: 'Sell',
      to: '/resident/sell',
      icon: PlusCircle,
      match: (path) => path.startsWith('/resident/sell'),
    },
    {
      label: 'Activity',
      to: '/resident/activity',
      icon: ClipboardList,
      match: (path) => path.startsWith('/resident/activity'),
    },
    {
      label: 'Market',
      to: '/resident/market',
      icon: Store,
      match: (path) => path.startsWith('/resident/market'),
    },
    {
      label: 'Profile',
      to: '/resident/profile',
      icon: UserRound,
      match: (path) => path.startsWith('/resident/profile'),
    },
  ],
  admin: [
    {
      label: 'Home',
      to: '/admin',
      icon: Home,
      match: (path) => path === '/admin' || path === '/admin/',
    },
    {
      label: 'Intake',
      to: '/admin/intake',
      icon: Scale,
      match: (path) => path.startsWith('/admin/intake'),
    },
    {
      label: 'Activity',
      to: '/admin/activity',
      icon: ClipboardList,
      match: (path) => path.startsWith('/admin/activity'),
    },
    {
      label: 'Market',
      to: '/admin/market',
      icon: Store,
      match: (path) => path.startsWith('/admin/market'),
    },
    {
      label: 'Profile',
      to: '/admin/profile',
      icon: UserRound,
      match: (path) => path.startsWith('/admin/profile'),
    },
  ],
  collector: [
    {
      label: 'Home',
      to: '/collector',
      icon: Home,
      match: (path) => path === '/collector' || path === '/collector/',
    },
    {
      label: 'Browse',
      to: '/collector/browse',
      icon: Package,
      match: (path) => path.startsWith('/collector/browse'),
    },
    {
      label: 'Orders',
      to: '/collector/orders',
      icon: Warehouse,
      match: (path) => path.startsWith('/collector/orders') && !path.startsWith('/collector/market'),
    },
    {
      label: 'Market',
      to: '/collector/market',
      icon: Store,
      match: (path) => path.startsWith('/collector/market'),
    },
    {
      label: 'Profile',
      to: '/collector/profile',
      icon: UserRound,
      match: (path) => path.startsWith('/collector/profile'),
    },
  ],
}

export function getNavItemsForRole(role: UserRole | null | undefined): InsideNavItem[] {
  if (!role) {
    return ROLE_NAV_ITEMS.resident
  }
  return ROLE_NAV_ITEMS[role]
}
