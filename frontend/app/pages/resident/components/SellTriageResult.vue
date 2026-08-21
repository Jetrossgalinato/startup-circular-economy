<script setup lang="ts">
import type { HazardTier } from '@/types/listings'

const props = defineProps<{
  tier: HazardTier
  reasons: string[]
  loading?: boolean
}>()

const tierCopy: Record<HazardTier, { title: string; body: string; tone: string }> = {
  1: {
    title: 'Tier 1 — Standard',
    body: 'Safe for standard pickup. Item will be weighed, tagged, and moved same-day through our cross-dock.',
    tone: 'bg-[#dce8ee] text-foreground',
  },
  2: {
    title: 'Tier 2 — Caution',
    body: 'Needs careful handling. Segregated staging and trained staff — still eligible for pickup.',
    tone: 'bg-[#ead9c4] text-foreground',
  },
  3: {
    title: 'Tier 3 — Hazardous',
    body: 'Routed to our hazardous track (TSD path). You can still be paid a fair per-kilo rate after weigh-in; it will not enter general resale inventory.',
    tone: 'bg-amber-100 text-amber-950',
  },
  4: {
    title: 'Tier 4 — Intake refused',
    body: 'We cannot safely pick this up. Contact DENR-EMB or the nearest accredited TSD facility for disposal guidance.',
    tone: 'bg-red-100 text-red-950',
  },
}

const copy = computed(() => tierCopy[props.tier])
</script>

<template>
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">
      Hazard
      <span class="font-serif font-medium italic">triage</span>
    </h2>
    <p class="mt-1.5 text-sm text-muted-foreground">
      Our first job is safety — not guessing resale value.
    </p>

    <div v-if="loading" class="mt-8 flex flex-col items-center gap-3 py-10">
      <div class="size-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      <p class="text-sm text-muted-foreground">Running safety classification…</p>
    </div>

    <div v-else class="mt-5 space-y-4">
      <div class="rounded-[1.5rem] p-5" :class="copy.tone">
        <p class="text-[10px] font-semibold tracking-[0.16em] uppercase opacity-60">
          Result
        </p>
        <p class="mt-1 text-xl font-bold tracking-tight">
          {{ copy.title }}
        </p>
        <p class="mt-2 text-sm leading-6 opacity-90">
          {{ copy.body }}
        </p>
      </div>

      <ul v-if="reasons.length" class="space-y-2">
        <li
          v-for="reason in reasons"
          :key="reason"
          class="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-foreground/80"
        >
          {{ reason }}
        </li>
      </ul>
    </div>
  </div>
</template>
