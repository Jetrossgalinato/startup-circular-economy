<script setup lang="ts">
import { ArrowUpRight, ChevronRight, Globe, Menu, Sparkle, Star, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Sell e-waste', href: '#sell-e-waste' },
  { label: 'Repair', href: '#repair' },
  { label: 'Company', href: '#company' },
]

const partners = ['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4', 'Partner 5']

const avatars = [
  { initials: 'AM', fill: '#1a3d36' },
  { initials: 'JR', fill: '#2d5c52' },
  { initials: 'KL', fill: '#4a7a6e' },
]

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <div class="bg-white text-foreground">
    <header class="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
      <div class="flex items-center justify-between gap-2 sm:gap-4">
        <a href="/" class="text-xl font-semibold tracking-tight text-foreground">
          E-WISE
        </a>

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

    <section class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-10">
      <div class="max-w-xl">
        <p class="text-xs font-semibold tracking-[0.18em] text-muted-foreground sm:tracking-[0.22em]">
          PILOTING IN BUTUAN CITY
        </p>
        <h1 class="mt-3 text-[2rem] font-bold leading-[1.2] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
          Change the way you handle your
          <span class="font-serif font-medium italic">e-waste</span>
        </h1>
        <p class="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          Sell, repair, or upcycle electronics through one city-scale platform. E-WISE buys from
          residents at a clear per-kilo rate, hazard-checks every item, and moves it the same day —
          collectors never contact you directly.
        </p>

        <div class="mt-7 flex flex-wrap items-center gap-5">
          <Button
            as="a"
            href="#"
            size="lg"
            class="h-12 w-full rounded-full bg-foreground px-7 text-base text-white hover:bg-foreground/90 sm:w-auto"
          >
            Get Started Now
          </Button>

          <div>
            <div class="flex items-center gap-1.5">
              <Star
                v-for="n in 5"
                :key="n"
                class="size-4 fill-amber-400 text-amber-400"
              />
              <span class="ml-1 text-sm font-semibold text-foreground">5.0</span>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">
              from 40+
              <span class="underline decoration-foreground/40 underline-offset-2">reviews</span>
            </p>
          </div>
        </div>
      </div>

      <div class="grid aspect-square grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
        <div class="overflow-hidden rounded-[1.75rem] bg-neutral-200">
          <svg viewBox="0 0 320 320" class="size-full" aria-hidden="true">
            <rect width="320" height="320" fill="#d8dce0" />
            <ellipse cx="160" cy="280" rx="90" ry="18" fill="#c5c9cd" />
            <path d="M70 210c20-70 50-110 90-118 40 8 70 48 90 118" fill="#cfd3d7" />
            <rect x="118" y="78" width="84" height="164" rx="14" fill="#1a1c1e" />
            <rect x="124" y="90" width="72" height="140" rx="6" fill="#e8f3ef" />
            <circle cx="160" cy="118" r="18" fill="#2d6a5a" opacity="0.85" />
            <rect x="136" y="148" width="48" height="6" rx="3" fill="#9bb8af" />
            <rect x="144" y="162" width="32" height="6" rx="3" fill="#c5d8d1" />
            <rect x="132" y="188" width="56" height="22" rx="11" fill="#1a3d36" />
          </svg>
        </div>

        <div class="relative flex flex-col justify-between rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-2xl rounded-bl-2xl bg-[#ead9c4] p-3 sm:p-5 lg:p-6">
          <div>
            <p class="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">7+</p>
            <p class="mt-1 text-sm font-medium text-foreground/70">Categories</p>
          </div>
          <Globe class="absolute right-3 bottom-3 size-8 text-foreground/25 sm:right-5 sm:bottom-5 sm:size-12" :stroke-width="1.25" />
        </div>

        <div class="flex flex-col justify-between rounded-tr-[2.5rem] rounded-2xl bg-[#dce8ee] p-3 sm:p-5 lg:p-6">
          <div class="flex gap-1 text-foreground">
            <Sparkle class="size-5 fill-foreground" />
            <Sparkle class="size-4 fill-foreground" />
          </div>
          <p class="text-base font-semibold leading-snug text-foreground sm:text-lg">Users Active</p>
          <div class="flex items-center justify-between">
            <div class="flex -space-x-2">
              <span
                v-for="avatar in avatars"
                :key="avatar.initials"
                class="flex size-7 items-center justify-center rounded-full border-2 border-[#dce8ee] text-[10px] font-semibold text-white sm:size-8"
                :style="{ backgroundColor: avatar.fill }"
              >
                {{ avatar.initials }}
              </span>
            </div>
            <a
              href="#"
              class="flex size-7 items-center justify-center rounded-full bg-foreground text-white sm:size-8"
              aria-label="See active users"
            >
              <ArrowUpRight class="size-4" />
            </a>
          </div>
        </div>

        <div class="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-foreground p-3 text-white sm:p-5 lg:p-6">
          <p class="flex items-center gap-1.5 text-xl font-bold tracking-tight sm:text-3xl">
            2,400 kg
            <svg viewBox="0 0 12 12" class="size-3.5 fill-white" aria-hidden="true">
              <path d="M6 1.5 10.5 7H8v3.5H4V7H1.5L6 1.5Z" />
            </svg>
          </p>
          <svg viewBox="0 0 200 64" class="w-full" aria-hidden="true">
            <path
              d="M0 48 L28 42 L52 50 L80 28 L108 34 L136 16 L164 22 L200 8"
              fill="none"
              stroke="white"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </svg>
          <p class="self-end text-sm text-white/80">Recovered</p>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <div class="border-t border-neutral-200 pt-7">
        <ul class="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-semibold tracking-wide text-neutral-400 sm:justify-between">
          <li v-for="partner in partners" :key="partner">
            {{ partner }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
