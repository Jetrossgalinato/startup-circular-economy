<script setup lang="ts">
import type { RateCardCategory } from '@/types/listings'
import { formatRatePerKg } from '@/utils/listings/format'

defineProps<{
  categories: RateCardCategory[]
}>()

const selected = defineModel<string | null>({ required: true })
</script>

<template>
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">
      Choose a
      <span class="font-serif font-medium italic">category</span>
    </h2>
    <p class="mt-1.5 text-sm text-muted-foreground">
      Pricing uses our published per-kilo rate card. Final amount is set after weigh-in at pickup.
    </p>

    <div class="mt-5 space-y-2">
      <button
        v-for="category in categories"
        :key="category.code"
        type="button"
        class="w-full rounded-2xl border px-4 py-3.5 text-left transition"
        :class="selected === category.code
          ? 'border-foreground bg-foreground text-white'
          : 'border-neutral-200 bg-white hover:border-neutral-300'"
        @click="selected = category.code"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">
              {{ category.code }} — {{ category.name }}
            </p>
            <p
              class="mt-0.5 text-xs leading-5"
              :class="selected === category.code ? 'text-white/75' : 'text-muted-foreground'"
            >
              {{ category.examples }}
            </p>
          </div>
          <p class="shrink-0 text-sm font-semibold">
            {{ formatRatePerKg(category.rate_per_kg) }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
