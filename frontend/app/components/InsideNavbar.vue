<script setup lang="ts">
import type { Component } from 'vue'
import { Home, PlusCircle, ClipboardList, UserRound } from '@lucide/vue'

export type InsideNavItem = {
  label: string
  to: string
  icon: Component
  match?: (path: string) => boolean
}

const props = withDefaults(defineProps<{
  items?: InsideNavItem[]
}>(), {
  items: undefined,
})

const route = useRoute()

const defaultItems: InsideNavItem[] = [
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
    label: 'Profile',
    to: '/resident/profile',
    icon: UserRound,
    match: (path) => path.startsWith('/resident/profile'),
  },
]

const navItems = computed(() => props.items ?? defaultItems)

function isActive(item: InsideNavItem) {
  if (item.match) {
    return item.match(route.path)
  }
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>

<template>
  <nav
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    aria-label="Primary"
  >
    <div
      class="pointer-events-auto flex w-full max-w-md items-center gap-1 rounded-full border border-neutral-200/80 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md"
    >
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-2 text-[10px] font-medium transition-colors sm:text-xs"
        :class="isActive(item)
          ? 'bg-foreground text-white'
          : 'text-foreground/55 hover:text-foreground'"
      >
        <component
          :is="item.icon"
          class="size-5"
          :stroke-width="isActive(item) ? 2.25 : 1.75"
        />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
