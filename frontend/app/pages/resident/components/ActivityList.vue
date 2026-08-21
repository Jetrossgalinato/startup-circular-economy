<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { LISTING_STATUS_LABELS } from '@/types/listings'
import { formatPeso, formatRatePerKg } from '@/utils/listings/format'

defineProps<{
  listings: Listing[]
  loading?: boolean
}>()
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="loading"
      class="rounded-2xl border border-neutral-200 px-4 py-8 text-center text-sm text-muted-foreground"
    >
      Loading activity…
    </div>
    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No listings yet</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Sell your first e-waste item to see it here.
      </p>
      <Button
        as-child
        class="mt-4 h-10 rounded-full bg-foreground px-5 text-white hover:bg-foreground/90"
      >
        <NuxtLink to="/resident/sell">
          Sell e-waste
        </NuxtLink>
      </Button>
    </div>

    <NuxtLink
      v-for="listing in listings"
      :key="listing.id"
      :to="`/resident/activity/${listing.id}`"
      class="block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold">
            {{ listing.rate_card_categories?.name || listing.category_code || 'Uncategorized' }}
          </p>
          <ActivityStatusBadge :status="listing.status" class="mt-1.5" />
        </div>
        <p class="text-xs text-muted-foreground">
          {{ new Date(listing.created_at).toLocaleDateString() }}
        </p>
      </div>
      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span v-if="listing.hazard_tier">Tier {{ listing.hazard_tier }}</span>
        <span v-if="listing.quoted_rate_per_kg">
          {{ formatRatePerKg(listing.quoted_rate_per_kg) }}
        </span>
        <span v-if="listing.final_amount != null">
          {{ formatPeso(listing.final_amount) }}
        </span>
        <span v-else-if="listing.status !== 'refused'">
          Amount after weigh-in
        </span>
      </div>
      <p class="sr-only">{{ LISTING_STATUS_LABELS[listing.status] }}</p>
    </NuxtLink>
  </div>
</template>
