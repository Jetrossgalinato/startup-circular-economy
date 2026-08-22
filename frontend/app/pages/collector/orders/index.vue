<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { FULFILLMENT_LABELS } from '@/types/listings'
import { formatListingDate, formatPeso } from '@/utils/listings/format'
import { collectorClaimMessage } from '@/utils/listings/claims'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const { fetchOrders, peekOrders } = useCollectorStock()
const listings = ref<Listing[]>(peekOrders() ?? [])
const loading = ref(listings.value.length === 0 && peekOrders() === null)
const { listingsTick } = useRealtimeTicks()

async function loadOrders(force = false) {
  const hadCache = peekOrders() !== null
  if (!hadCache) {
    loading.value = true
  }

  try {
    listings.value = await fetchOrders({ force })
  } catch {
    if (!hadCache) {
      listings.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadOrders())

watch(listingsTick, () => {
  void loadOrders(true)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Orders
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Claimed lots. Pickup at the Butuan cross-dock, or delivery to your address.
    </p>

    <div v-if="loading" class="text-sm text-muted-foreground">
      Loading orders…
    </div>
    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No claims yet</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Browse company stock to reserve a lot.
      </p>
      <Button
        as-child
        class="mt-4 h-10 rounded-full bg-foreground px-5 text-white hover:bg-foreground/90"
      >
        <NuxtLink to="/collector/browse">
          Browse stock
        </NuxtLink>
      </Button>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="listing in listings"
        :key="listing.id"
        class="rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <CollectorStockCard :listing="listing" />
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
        <p v-else-if="listing.fulfillment_method === 'pickup'" class="mt-1 text-sm text-muted-foreground">
          Collect at the Butuan City cross-dock. Staff will match this order.
        </p>
        <p class="mt-3 text-sm font-medium text-foreground">
          {{ collectorClaimMessage(listing) }}
        </p>
        <p class="mt-2 text-xs text-muted-foreground">
          {{ listing.claimed_at ? formatListingDate(listing.claimed_at) : formatListingDate(listing.created_at) }}
          <span v-if="listing.final_amount != null"> · {{ formatPeso(listing.final_amount) }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
