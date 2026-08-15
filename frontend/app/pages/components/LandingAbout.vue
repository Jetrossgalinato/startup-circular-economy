<script setup lang="ts">
import { Globe } from '@lucide/vue'

const categories = [
  { mark: 'A', label: 'Appliances' },
  { mark: 'D', label: 'Computing' },
  { mark: 'E', label: 'Batteries' },
]
</script>

<template>
  <section id="company" class="scroll-mt-24 bg-white px-6 pb-20 pt-0 text-foreground">
    <div class="mx-auto max-w-6xl">
      <div class="border-t border-neutral-200 pt-16">
        <header class="mx-auto max-w-2xl text-center">
          <p class="text-xs font-semibold tracking-[0.22em] text-primary">
            ABOUT US
          </p>
          <h2 class="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            One platform for all your e-waste
          </h2>
          <p class="mt-4 text-base text-muted-foreground sm:text-lg">
            Sell, repair, or upcycle without chasing collectors or guessing a price.
          </p>
        </header>

      <div class="mt-14 grid gap-5 lg:grid-cols-[1fr_2fr] lg:gap-6">
        <article class="flex min-h-[340px] flex-col justify-between rounded-3xl bg-foreground p-7 text-white sm:min-h-[400px] sm:p-8">
          <h3 class="text-xl font-semibold sm:text-2xl">
            Get paid per kilo
          </h3>

          <div class="relative mt-10 flex h-44 items-end justify-between gap-3 px-1 sm:h-52">
            <span class="w-8 rounded-t-md bg-white/20 sm:w-10" style="height: 38%" />
            <span class="w-8 rounded-t-md bg-white/25 sm:w-10" style="height: 52%" />
            <div class="relative flex w-10 flex-col items-center sm:w-12">
              <span class="absolute -top-8 text-sm font-semibold tracking-tight sm:text-base">
                ₱12,000
              </span>
              <svg viewBox="0 0 48 160" class="h-36 w-10 sm:h-44 sm:w-12" aria-hidden="true">
                <path
                  d="M24 4 L44 52 H32 V156 H16 V52 H4 Z"
                  fill="white"
                />
              </svg>
            </div>
            <span class="w-8 rounded-t-md bg-white/25 sm:w-10" style="height: 64%" />
            <span class="w-8 rounded-t-md bg-white/20 sm:w-10" style="height: 46%" />
          </div>
        </article>

        <article class="relative min-h-[340px] overflow-hidden rounded-3xl rounded-bl-[4.5rem] bg-[#eef3f0] p-7 sm:min-h-[400px] sm:p-8">
          <h3 class="relative z-10 text-xl font-semibold text-foreground sm:text-2xl">
            Same-day cross-dock
          </h3>

          <div class="pointer-events-none absolute inset-0 flex items-end justify-center pb-6">
            <div class="relative size-56 sm:size-72">
              <span class="absolute inset-0 rounded-full border border-foreground/10" />
              <span class="absolute inset-8 rounded-full border border-foreground/10" />
              <span class="absolute inset-16 rounded-full border border-foreground/10" />
              <Globe
                class="absolute inset-0 m-auto size-16 text-foreground/25 sm:size-20"
                :stroke-width="1.15"
              />
            </div>
          </div>

          <div class="relative z-10 mt-10 flex min-h-[220px] flex-wrap items-start justify-between gap-4 sm:mt-16">
            <div class="w-[11.5rem] rounded-2xl bg-white p-3 shadow-sm">
              <div class="mb-3 h-16 overflow-hidden rounded-xl bg-neutral-200">
                <svg viewBox="0 0 160 80" class="size-full" aria-hidden="true">
                  <rect width="160" height="80" fill="#d8dce0" />
                  <rect x="58" y="10" width="44" height="60" rx="8" fill="#1a1c1e" />
                  <rect x="62" y="16" width="36" height="48" rx="3" fill="#e8f3ef" />
                </svg>
              </div>
              <p class="text-xl font-bold tracking-tight text-foreground">12.4 kg</p>
              <p class="text-sm text-muted-foreground">Pickup logged</p>
              <div class="mt-3 flex -space-x-2">
                <span class="flex size-7 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-white">AM</span>
                <span class="flex size-7 items-center justify-center rounded-full bg-[#2d5c52] text-[10px] font-semibold text-white">JR</span>
              </div>
            </div>

            <div class="mt-4 flex flex-col items-end gap-6 sm:mt-0">
              <div class="relative">
                <div class="rounded-2xl rounded-bl-sm bg-foreground px-4 py-3 text-white shadow-sm">
                  <p class="text-lg font-bold tracking-tight">Tier 1</p>
                  <p class="text-sm text-white/80">Hazard-cleared</p>
                </div>
                <span class="absolute -bottom-3 left-4 flex size-8 items-center justify-center rounded-full border-2 border-[#eef3f0] bg-[#4a7a6e] text-[10px] font-semibold text-white">
                  KL
                </span>
              </div>

              <div class="flex -space-x-2" aria-label="Device categories">
                <span
                  v-for="category in categories"
                  :key="category.mark"
                  class="flex size-9 items-center justify-center rounded-full border-2 border-white bg-foreground text-xs font-semibold text-white"
                  :title="category.label"
                >
                  {{ category.mark }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
      </div>
    </div>
  </section>
</template>
