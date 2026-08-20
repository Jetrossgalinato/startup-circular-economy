<script setup lang="ts">
import { ChevronRight, Menu, X } from '@lucide/vue'
import ewiseLogo from '~/assets/images/looogo.png'

const navLinks = [
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Sell e-waste', to: '/#sell-e-waste' },
  { label: 'Repair', to: '/#repair' },
  { label: 'Company', to: '/#company' },
]

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
    <div class="flex w-full items-center justify-between gap-4">
      <NuxtLink
        to="/"
        class="flex shrink-0 items-center"
        aria-label="E-WISE home"
      >
        <img
          :src="ewiseLogo"
          alt="E-WISE"
          class="h-14 w-auto object-contain sm:h-16"
        >
      </NuxtLink>

      <nav class="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="transition-colors hover:text-foreground"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-1.5 sm:gap-3">
        <Button variant="ghost" as-child class="text-sm font-medium text-foreground">
          <NuxtLink to="/auth/login">
            Login
          </NuxtLink>
        </Button>
        <Button
          as-child
          class="h-9 rounded-full bg-foreground px-3.5 text-sm text-white hover:bg-foreground/90 sm:h-10 sm:px-5"
        >
          <NuxtLink to="/auth/register" class="inline-flex items-center gap-1">
            Sign Up
            <ChevronRight class="hidden size-4 sm:block" />
          </NuxtLink>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="size-5" />
          <Menu v-else class="size-5" />
        </Button>
      </div>
    </div>

    <nav
      v-show="menuOpen"
      id="mobile-nav"
      class="mt-4 flex flex-col gap-1 border-t border-neutral-200 pt-4 md:hidden"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-neutral-50 hover:text-foreground"
        @click="closeMenu"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
