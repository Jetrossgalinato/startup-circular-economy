<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'

const values = [
  {
    title: 'Transparency',
    body: 'Published per-kilo rates by device category — the same method local scrap buyers already understand, and a price we can defend.',
    href: '#sell-e-waste',
    accent: false,
    icon: 'circles',
  },
  {
    title: 'Safety first',
    body: 'Every item is hazard-checked at intake. Lithium batteries and damaged units are diverted before they reach untrained hands.',
    href: '#how-it-works',
    accent: false,
    icon: 'diamonds',
  },
  {
    title: 'Responsible custody',
    body: 'Residents never deal with collectors directly. Items pass a company cross-dock the same day, with a logged chain of custody.',
    href: '#company',
    accent: true,
    icon: 'orbit',
  },
] as const
</script>

<template>
  <section id="how-it-works" class="scroll-mt-24 bg-white px-6 pb-48 text-foreground">
    <div class="mx-auto max-w-6xl">
      <header class="grid items-end gap-4 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <div>
          <p class="text-xs font-semibold tracking-[0.22em] text-primary">
            VALUES
          </p>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Make every device, well-used
          </h2>
        </div>
        <p class="max-w-md text-base leading-7 text-muted-foreground">
          E-WISE sits between residents and collectors in Butuan City — with a clear rate card,
          hazard triage, and same-day dispatch instead of informal, untracked e-waste deals.
        </p>
      </header>

      <div class="mt-10 grid gap-5 md:grid-cols-3">
        <article
          v-for="value in values"
          :key="value.title"
          class="flex flex-col p-6"
          :class="value.accent
            ? 'rounded-tr-[2.75rem] bg-[#ead9c4]'
            : 'rounded-none border border-neutral-200 bg-white'"
        >
          <div>
            <svg
              v-if="value.icon === 'circles'"
              viewBox="0 0 48 48"
              class="size-10 text-foreground"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="10" />
              <circle cx="32" cy="16" r="10" />
              <circle cx="16" cy="32" r="10" />
              <circle cx="32" cy="32" r="10" />
            </svg>
            <svg
              v-else-if="value.icon === 'diamonds'"
              viewBox="0 0 48 48"
              class="size-10 text-foreground"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <rect x="10" y="10" width="18" height="18" rx="5" transform="rotate(45 19 19)" />
              <rect x="22" y="10" width="18" height="18" rx="5" transform="rotate(45 31 19)" />
            </svg>
            <svg
              v-else
              viewBox="0 0 48 48"
              class="size-10 text-foreground"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <circle cx="24" cy="24" r="16" />
              <circle cx="24" cy="28" r="10" />
              <circle cx="24" cy="31" r="5" />
            </svg>

            <h3 class="mt-5 text-xl font-semibold tracking-tight text-foreground">
              {{ value.title }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              {{ value.body }}
            </p>
          </div>

          <a
            :href="value.href"
            class="mt-6 flex size-10 items-center justify-center rounded-full border"
            :class="value.accent
              ? 'border-foreground bg-foreground text-white'
              : 'border-neutral-200 bg-white text-foreground'"
            :aria-label="`Learn more about ${value.title}`"
          >
            <ArrowUpRight class="size-4" />
          </a>
        </article>
      </div>
    </div>
  </section>
</template>
