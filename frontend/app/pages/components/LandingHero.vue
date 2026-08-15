<script setup lang="ts">
import { ArrowUpRight, ChevronRight, Globe, Sparkle, Star } from '@lucide/vue'
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
</script>

<template>
  <div class="min-h-screen bg-white text-foreground">
    <header class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
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

      <div class="flex items-center gap-3">
        <Button variant="ghost" as="a" href="#login" class="text-sm font-medium text-foreground">
          Login
        </Button>
        <Button
          as="a"
          href="#signup"
          class="h-10 rounded-full bg-foreground px-5 text-sm text-white hover:bg-foreground/90"
        >
          Sign Up
          <ChevronRight class="size-4" />
        </Button>
      </div>
    </header>

    <section class="mx-auto grid max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
      <div class="max-w-xl">
        <p class="text-xs font-semibold tracking-[0.22em] text-muted-foreground">
          PILOTING IN BUTUAN CITY
        </p>
        <h1 class="mt-4 text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
          Change the way you handle your
          <span class="font-serif font-medium italic">e-waste</span>
        </h1>
        <p class="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
          Sell, repair, or upcycle electronics through one city-scale platform. E-WISE buys from
          residents at a clear per-kilo rate, hazard-checks every item, and moves it the same day —
          collectors never contact you directly.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-6">
          <Button
            as="a"
            href="#"
            size="lg"
            class="h-12 rounded-full bg-foreground px-7 text-base text-white hover:bg-foreground/90"
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

        <div class="relative flex flex-col justify-between rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-2xl rounded-bl-2xl bg-[#ead9c4] p-5 sm:p-6">
          <div>
            <p class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">7+</p>
            <p class="mt-1 text-sm font-medium text-foreground/70">Categories</p>
          </div>
          <Globe class="absolute right-5 bottom-5 size-10 text-foreground/25 sm:size-12" :stroke-width="1.25" />
        </div>

        <div class="flex flex-col justify-between rounded-tr-[2.5rem] rounded-2xl bg-[#dce8ee] p-5 sm:p-6">
          <div class="flex gap-1 text-foreground">
            <Sparkle class="size-5 fill-foreground" />
            <Sparkle class="size-4 fill-foreground" />
          </div>
          <p class="text-lg font-semibold leading-snug text-foreground">Users Active</p>
          <div class="flex items-center justify-between">
            <div class="flex -space-x-2">
              <span
                v-for="avatar in avatars"
                :key="avatar.initials"
                class="flex size-8 items-center justify-center rounded-full border-2 border-[#dce8ee] text-[10px] font-semibold text-white"
                :style="{ backgroundColor: avatar.fill }"
              >
                {{ avatar.initials }}
              </span>
            </div>
            <a
              href="#"
              class="flex size-8 items-center justify-center rounded-full bg-foreground text-white"
              aria-label="See active users"
            >
              <ArrowUpRight class="size-4" />
            </a>
          </div>
        </div>

        <div class="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-foreground p-5 text-white sm:p-6">
          <p class="flex items-center gap-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
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

    <div class="mx-auto max-w-6xl px-6 pb-8">
      <div class="border-t border-neutral-200 pt-8">
        <ul class="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 text-sm font-semibold tracking-wide text-neutral-400">
          <li v-for="partner in partners" :key="partner">
            {{ partner }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
