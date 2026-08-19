<script setup lang="ts">
import { Globe } from '@lucide/vue'

const bars = [
  { height: '38%' },
  { height: '55%' },
  { height: '72%' },
  { height: '48%' },
]
</script>

<template>
  <section id="company" class="scroll-mt-24 bg-white px-4 pb-16 pt-0 text-foreground sm:px-6 sm:pb-24 lg:pb-30">
    <div class="mx-auto max-w-6xl">
      <div class="pt-12 sm:pt-20">
        <header class="mx-auto max-w-2xl text-center">
          <p class="text-xs font-semibold tracking-[0.22em] text-primary">
            ABOUT US
          </p>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            One platform for all your e-waste
          </h2>
          <p class="mt-3 text-base text-muted-foreground sm:text-lg">
            Sell, repair, or upcycle without chasing collectors or guessing a price.
          </p>
        </header>

        <div class="mt-10 grid gap-5 lg:grid-cols-2">
          <article class="flex flex-col justify-between rounded-3xl bg-foreground p-6 text-white sm:p-8">
            <div>
              <h3 class="text-xl font-semibold tracking-tight sm:text-2xl">
                Get paid per kilo
              </h3>
              <p class="mt-2 max-w-sm text-sm leading-6 text-white/70 sm:text-base">
                A published rate card by device category — the same method local scrap buyers already use, and a price we can defend.
              </p>
            </div>

            <div class="mt-10 flex items-end justify-between gap-6">
              <div>
                <p class="text-4xl font-bold tracking-tight sm:text-5xl">₱12.40</p>
                <p class="mt-1 text-sm text-white/70">per kilo · appliances</p>
              </div>

              <div class="flex h-24 items-end gap-1.5 sm:h-28 sm:gap-2" aria-hidden="true">
                <span
                  v-for="(bar, index) in bars"
                  :key="index"
                  class="w-3 rounded-t-sm bg-white/25 sm:w-4"
                  :class="index === 2 ? 'bg-white/80' : 'bg-white/20'"
                  :style="{ height: bar.height }"
                />
              </div>
            </div>
          </article>

          <article class="relative flex flex-col justify-between overflow-hidden rounded-3xl rounded-bl-[2.5rem] bg-[#eef3f0] p-6 sm:rounded-bl-[4.5rem] sm:p-8">
            <Globe
              class="pointer-events-none absolute right-4 bottom-4 size-16 text-foreground/10 sm:right-6 sm:bottom-6 sm:size-24"
              :stroke-width="1.15"
              aria-hidden="true"
            />

            <div class="relative">
              <h3 class="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Same-day cross-dock
              </h3>
              <p class="mt-2 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                Every item is hazard-checked at intake, then moved the same day. Collectors never contact you directly.
              </p>
            </div>

            <div class="relative mt-8 grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-white p-4">
                <p class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">12.4 kg</p>
                <p class="mt-1 text-sm text-muted-foreground">Pickup logged</p>
              </div>
              <div class="rounded-2xl bg-foreground p-4 text-white">
                <p class="text-2xl font-bold tracking-tight sm:text-3xl">Same day</p>
                <p class="mt-1 text-sm text-white/75">Hazard-cleared</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
