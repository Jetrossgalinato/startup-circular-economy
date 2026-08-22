<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { claimedListings } from '@/utils/listings/claims'

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
    listings.value = await markClaimsSeen()
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

function onClaimUpdated(listing: Listing) {
  if (listing.status !== 'claimed') {
    listings.value = listings.value.filter((item) => item.id !== listing.id)
    return
  }
  listings.value = claimedListings(
    listings.value.map((item) => item.id === listing.id ? listing : item),
  )
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Claims
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Collector claims on company stock. Pickup at the cross-dock or delivery to their address.
    </p>
    <AdminClaimsList
      :listings="listings"
      :loading="loading"
      @updated="onClaimUpdated"
    />
  </div>
</template>
