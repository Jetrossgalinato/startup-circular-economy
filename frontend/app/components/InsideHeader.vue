<script setup lang="ts">
import ewiseLogo from '~/assets/images/looogo.png'
import type { UserRole } from '@/types/auth'
import { ROLE_HOME_ROUTES } from '@/constants/auth'

const ROLE_LABELS: Record<UserRole, string> = {
  resident: 'Resident',
  admin: 'Admin',
  collector: 'Collector',
}

const { profile } = useAuth()

const roleLabel = computed(() => {
  const role = profile.value?.role
  return role ? ROLE_LABELS[role] : 'Account'
})

const homeTo = computed(() => {
  const role = profile.value?.role
  return role ? ROLE_HOME_ROUTES[role] : '/'
})
</script>

<template>
  <header class="flex items-center justify-between gap-3">
    <NuxtLink
      :to="homeTo"
      class="flex shrink-0 items-center"
      aria-label="E-WISE home"
    >
      <img
        :src="ewiseLogo"
        alt="E-WISE"
        class="h-11 w-auto object-contain sm:h-12"
      >
    </NuxtLink>

    <div class="flex items-center gap-2 sm:gap-3">
      <ChatHeaderButton />
      <p class="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase sm:text-sm sm:tracking-[0.18em]">
        {{ roleLabel }}
      </p>
    </div>
  </header>
</template>
