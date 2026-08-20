<script setup lang="ts">
import { ChevronRight, Menu, X } from '@lucide/vue'
import ewiseLogo from '~/assets/images/looogo.png'

const navLinks = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Sell e-waste', href: '/#sell-e-waste' },
  { label: 'Repair', href: '/#repair' },
  { label: 'Company', href: '/#company' },
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
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="transition-colors hover:text-foreground"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="flex items-center gap-1.5 sm:gap-3">
        <Button variant="ghost" as="a" href="/auth/login" class="text-sm font-medium text-foreground">
          Login
        </Button>
        <Button
          as="a"
          href="/auth/register"
          class="h-9 rounded-full bg-foreground px-3.5 text-sm text-white hover:bg-foreground/90 sm:h-10 sm:px-5"
        >
          Sign Up
          <ChevronRight class="hidden size-4 sm:block" />
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
      <a
        v-for="link in navLinks"
        :key="link.href"
        :href="link.href"
        class="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-neutral-50 hover:text-foreground"
        @click="closeMenu"
      >
        {{ link.label }}
      </a>
    </nav>
  </header>
</template>
