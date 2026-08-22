<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { FULFILLMENT_LABELS } from '@/types/listings'
import { formatListingDate, formatPeso } from '@/utils/listings/format'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { fetchClaims, peekClaims, markClaimsSeen } = useAdminClaims()
const listings = ref<Listing[]>(peekClaims() ?? [])
const loading = ref(listings.value.length === 0 && peekClaims() === null)
const { listingsTick } = useRealtimeTicks()

async function loadClaims(force = false) {
  const hadCache = peekClaims() !== null
  if (!hadCache) {
    loading.value = true
  }

  try {
    listings.value = await fetchClaims({ force })
    await markClaimsSeen()
    listings.value = listings.value.map((listing) => ({
      ...listing,
      claimed_seen_at: listing.claimed_seen_at ?? new Date().toISOString(),
    }))
  } catch {
    if (!hadCache) {
      listings.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadClaims())

watch(listingsTick, () => {
  void loadClaims(true)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Claims
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Collector claims on company stock. Pickup at the cross-dock or delivery to their address.
    </p>

    <div v-if="loading" class="text-sm text-muted-foreground">
      Loading claims…
    </div>
    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No claims yet</p>
      <p class="mt-1 text-sm text-muted-foreground">
        New collector claims will show up here.
      </p>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="listing in listings"
        :key="listing.id"
        :to="`/admin/activity/${listing.id}`"
        class="block rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">
              {{ listing.rate_card_categories?.name || listing.category_code || 'Item' }}
            </p>
            <ActivityStatusBadge :status="listing.status" class="mt-1.5" />
          </div>
          <p class="text-sm font-semibold">
            {{ listing.final_amount != null ? formatPeso(listing.final_amount) : '—' }}
          </p>
        </div>
        <p class="mt-3 text-sm text-foreground">
          {{ listing.fulfillment_method
            ? FULFILLMENT_LABELS[listing.fulfillment_method]
            : 'Claimed' }}
        </p>
        <p
          v-if="listing.fulfillment_method === 'delivery' && listing.delivery_address"
          class="mt-1 whitespace-pre-wrap text-sm text-muted-foreground"
        >
          {{ listing.delivery_address }}
        </p>
        <p class="mt-1 text-xs text-muted-foreground">
          {{ formatListingDate(listing.claimed_at || listing.created_at) }}
          <span v-if="listing.weight_kg != null"> · {{ listing.weight_kg }} kg</span>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
