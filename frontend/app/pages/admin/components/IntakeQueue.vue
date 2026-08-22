<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { claimBadgeLabel } from '@/utils/listings/claims'

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
      Loading intake queue…
    </div>
    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">Intake queue is empty</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Scheduled pickups will appear here after residents confirm a sell.
      </p>
    </div>

    <NuxtLink
      v-for="listing in listings"
      :key="listing.id"
      :to="`/admin/intake/${listing.id}`"
      class="block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold">
            {{ listing.rate_card_categories?.name || listing.category_code || 'Uncategorized' }}
          </p>
          <ActivityStatusBadge
            :status="listing.status"
            :label="claimBadgeLabel(listing)"
            class="mt-1.5"
          />
        </div>
        <p v-if="listing.hazard_tier" class="text-xs font-semibold text-muted-foreground">
          Tier {{ listing.hazard_tier }}
        </p>
      </div>
      <p class="mt-3 text-sm text-foreground/80">
        {{ listing.pickup_address || 'No pickup address' }}
      </p>
      <p v-if="listing.preferred_pickup_window" class="mt-1 text-xs text-muted-foreground">
        {{ listing.preferred_pickup_window }}
      </p>
      <p class="mt-2 text-xs text-muted-foreground">
        {{ listing.resident?.full_name || 'Resident' }}
      </p>
    </NuxtLink>
  </div>
</template>
