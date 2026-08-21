<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { formatRatePerKg } from '@/utils/listings/format'

defineProps<{
  name: string
  activeCount: number
  recent: Listing[]
}>()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Hello,
        <span class="font-serif font-medium italic">{{ name.split(' ')[0] || 'there' }}</span>
      </h1>
      <p class="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
        Sell e-waste at a clear per-kilo rate. We hazard-check every item and move it the same day —
        collectors never contact you directly.
      </p>
    </div>

    <Button
      as-child
      size="lg"
      class="h-12 w-full rounded-full bg-foreground text-base text-white hover:bg-foreground/90"
    >
      <NuxtLink to="/resident/sell">
        Sell e-waste
      </NuxtLink>
    </Button>

    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-[1.5rem] bg-[#dce8ee] p-4">
        <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
          ACTIVE
        </p>
        <p class="mt-1 text-3xl font-bold tracking-tight">
          {{ activeCount }}
        </p>
        <p class="mt-0.5 text-sm text-foreground/70">
          Listings in progress
        </p>
      </div>
      <div class="rounded-[1.5rem] bg-[#ead9c4] p-4">
        <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
          PILOT
        </p>
        <p class="mt-1 text-xl font-bold tracking-tight leading-tight">
          Butuan City
        </p>
        <p class="mt-1 text-sm text-foreground/70">
          Same-day cross-dock
        </p>
      </div>
    </div>

    <div v-if="recent.length">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold">Recent activity</h2>
        <NuxtLink to="/resident/activity" class="text-sm text-muted-foreground underline underline-offset-2">
          See all
        </NuxtLink>
      </div>
      <div class="space-y-2">
        <NuxtLink
          v-for="listing in recent"
          :key="listing.id"
          :to="`/resident/activity/${listing.id}`"
          class="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3"
        >
          <div>
            <p class="text-sm font-medium">
              {{ listing.rate_card_categories?.name || 'Listing' }}
            </p>
            <ActivityStatusBadge :status="listing.status" class="mt-1" />
          </div>
          <p class="text-xs text-muted-foreground">
            {{ listing.quoted_rate_per_kg != null ? formatRatePerKg(listing.quoted_rate_per_kg) : '' }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
