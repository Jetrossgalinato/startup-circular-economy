<script setup lang="ts">
import type { Listing, ListingStatus } from '@/types/listings'
import { LISTING_STATUS_LABELS } from '@/types/listings'

const props = defineProps<{
  listings: Listing[]
}>()

const statusFilter = defineModel<ListingStatus | 'all'>('status', { default: 'all' })
const categoryFilter = defineModel<string>('category', { default: 'all' })

const statusOptions = computed(() => {
  const present = new Set(props.listings.map((listing) => listing.status))
  const order: ListingStatus[] = [
    'pickup_scheduled',
    'weighed',
    'paid',
    'claimed',
    'cancelled',
    'refused',
    'accepted',
    'awaiting_acceptance',
    'triaging',
    'draft',
  ]
  return order.filter((status) => present.has(status))
})

const categoryOptions = computed(() => {
  const seen = new Map<string, string>()
  for (const listing of props.listings) {
    const code = listing.category_code || 'uncategorized'
    const label = listing.rate_card_categories?.name || listing.category_code || 'Uncategorized'
    if (!seen.has(code)) {
      seen.set(code, label)
    }
  }
  return [...seen.entries()].map(([value, label]) => ({ value, label }))
})

function chipClass(active: boolean) {
  return active
    ? 'border-foreground bg-foreground text-white'
    : 'border-neutral-200 bg-white text-foreground/80'
}
</script>

<template>
  <div class="mb-4 space-y-3">
    <div class="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
        :class="chipClass(statusFilter === 'all')"
        @click="statusFilter = 'all'"
      >
        All statuses
      </button>
      <button
        v-for="status in statusOptions"
        :key="status"
        type="button"
        class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
        :class="chipClass(statusFilter === status)"
        @click="statusFilter = status"
      >
        {{ LISTING_STATUS_LABELS[status] }}
      </button>
    </div>

    <div v-if="categoryOptions.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
        :class="chipClass(categoryFilter === 'all')"
        @click="categoryFilter = 'all'"
      >
        All categories
      </button>
      <button
        v-for="option in categoryOptions"
        :key="option.value"
        type="button"
        class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
        :class="chipClass(categoryFilter === option.value)"
        @click="categoryFilter = option.value"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
