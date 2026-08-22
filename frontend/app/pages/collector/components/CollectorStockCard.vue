<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { formatPeso, formatRatePerKg } from '@/utils/listings/format'

defineProps<{
  listing: Listing
}>()
</script>

<template>
  <div class="rounded-2xl border border-neutral-200 bg-white p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold">
          {{ listing.rate_card_categories?.name || listing.category_code || 'Item' }}
        </p>
        <ActivityStatusBadge :status="listing.status" class="mt-1.5" />
      </div>
      <p class="text-sm font-semibold">
        {{ listing.final_amount != null ? formatPeso(listing.final_amount) : formatRatePerKg(listing.quoted_rate_per_kg) }}
      </p>
    </div>
    <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span v-if="listing.weight_kg != null">{{ listing.weight_kg }} kg</span>
      <span v-if="listing.hazard_tier">Tier {{ listing.hazard_tier }}</span>
    </div>
  </div>
</template>
