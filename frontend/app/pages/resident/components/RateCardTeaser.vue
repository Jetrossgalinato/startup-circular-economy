<script setup lang="ts">
import type { RateCardCategory } from '@/types/listings'
import { formatRatePerKg } from '@/utils/listings/format'

defineProps<{
  categories: RateCardCategory[]
}>()
</script>

<template>
  <section class="mt-8">
    <p class="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
      Rate card
    </p>
    <h2 class="mt-1 text-lg font-bold tracking-tight">
      Transparent
      <span class="font-serif font-medium italic">per kilo</span>
    </h2>
    <p class="mt-1 text-sm text-muted-foreground">
      Same method local scrap buyers use — published rates you can verify with a scale at pickup.
    </p>

    <div class="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200">
      <div
        v-for="category in categories.slice(0, 5)"
        :key="category.code"
        class="flex items-center justify-between gap-3 bg-white px-4 py-3"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium">
            {{ category.code }} · {{ category.name }}
          </p>
        </div>
        <p class="shrink-0 text-sm font-semibold">
          {{ formatRatePerKg(category.rate_per_kg) }}
        </p>
      </div>
    </div>
  </section>
</template>
