<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'

const values = [
  {
    title: 'Transparency',
    body: 'Published per-kilo rates by device category — the same method local scrap buyers already understand, and a price we can defend.',
    href: '#sell-e-waste',
    index: '01',
    tone: 'mint',
    icon: 'circles',
  },
  {
    title: 'Safety first',
    body: 'Every item is hazard-checked at intake. Lithium batteries and damaged units are diverted before they reach untrained hands.',
    href: '#how-it-works',
    index: '02',
    tone: 'dark',
    icon: 'diamonds',
  },
  {
    title: 'Responsible custody',
    body: 'Residents never deal with collectors directly. Items pass a company cross-dock the same day, with a logged chain of custody.',
    href: '#company',
    index: '03',
    tone: 'sand',
    icon: 'orbit',
  },
] as const
</script>

<template>
  <section id="how-it-works" class="scroll-mt-24 bg-white px-4 pb-16 text-foreground sm:px-6 sm:pb-20">
    <div class="mx-auto max-w-6xl border-t border-neutral-200 pt-12 sm:pt-15">
      <header class="mx-auto max-w-2xl text-center lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-10 lg:text-left">
        <div>
          <p class="text-xs font-semibold tracking-[0.22em] text-primary">
            VALUES
          </p>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Make every device, well-used
          </h2>
        </div>
        <p class="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground lg:mx-0 lg:mt-0">
          E-WISE sits between residents and collectors in Butuan City — with a clear rate card,
          hazard triage, and same-day dispatch instead of informal, untracked e-waste deals.
        </p>
      </header>

      <div class="mt-10 grid gap-4 sm:gap-5 md:grid-cols-3">
        <article
          v-for="value in values"
          :key="value.title"
          class="flex flex-col justify-between p-6 sm:p-7"
          :class="{
            'rounded-3xl bg-[#eef3f0]': value.tone === 'mint',
            'rounded-3xl bg-foreground text-white': value.tone === 'dark',
            'rounded-3xl rounded-tr-[2.75rem] bg-[#ead9c4]': value.tone === 'sand',
          }"
        >
          <div>
            <div class="flex items-start justify-between gap-3">
              <span
                class="flex size-11 items-center justify-center rounded-full"
                :class="value.tone === 'dark' ? 'bg-white/10 text-white' : 'bg-white text-foreground'"
                aria-hidden="true"
              >
                <svg
                  v-if="value.icon === 'circles'"
                  viewBox="0 0 48 48"
                  class="size-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                >
                  <circle cx="16" cy="16" r="10" />
                  <circle cx="32" cy="16" r="10" />
                  <circle cx="16" cy="32" r="10" />
                  <circle cx="32" cy="32" r="10" />
                </svg>
                <svg
                  v-else-if="value.icon === 'diamonds'"
                  viewBox="0 0 48 48"
                  class="size-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                >
                  <rect x="10" y="10" width="18" height="18" rx="5" transform="rotate(45 19 19)" />
                  <rect x="22" y="10" width="18" height="18" rx="5" transform="rotate(45 31 19)" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 48 48"
                  class="size-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                >
                  <circle cx="24" cy="24" r="16" />
                  <circle cx="24" cy="28" r="10" />
                  <circle cx="24" cy="31" r="5" />
                </svg>
              </span>
              <span
                class="text-sm font-semibold tracking-tight"
                :class="value.tone === 'dark' ? 'text-white/50' : 'text-foreground/40'"
              >
                {{ value.index }}
              </span>
            </div>

            <h3 class="mt-6 text-xl font-semibold tracking-tight sm:text-2xl">
              {{ value.title }}
            </h3>
            <p
              class="mt-2 text-sm leading-6 sm:text-base"
              :class="value.tone === 'dark' ? 'text-white/70' : 'text-muted-foreground'"
            >
              {{ value.body }}
            </p>
          </div>

          <a
            :href="value.href"
            class="mt-8 inline-flex items-center gap-2 text-sm font-medium"
            :class="value.tone === 'dark' ? 'text-white' : 'text-foreground'"
          >
            Learn more
            <span
              class="flex size-8 items-center justify-center rounded-full"
              :class="value.tone === 'dark' ? 'bg-white text-foreground' : 'bg-foreground text-white'"
            >
              <ArrowUpRight class="size-4" />
            </span>
          </a>
        </article>
      </div>
    </div>
  </section>
</template>
