<script setup lang="ts">
import type { Listing } from '@/types/listings'

definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})

const { fetchMyListings, peekListings } = useListings()
const listings = ref<Listing[]>(peekListings() ?? [])
const loading = ref(listings.value.length === 0 && peekListings() === null)
const { listingsTick } = useRealtimeTicks()

async function loadListings(force = false) {
  const hadCache = peekListings() !== null
  if (!hadCache) {
    loading.value = true
  }

  try {
    listings.value = await fetchMyListings({ force })
  } catch {
    if (!hadCache) {
      listings.value = []
    }
  } finally {
    loading.value = false
  }
}

function onCancelled(id: string) {
  listings.value = listings.value.filter((listing) => listing.id !== id)
}

onMounted(() => loadListings())

watch(listingsTick, () => {
  void loadListings(true)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Activity
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Track sell requests, pickups, weigh-in, and payouts.
    </p>
    <ActivityList
      :listings="listings"
      :loading="loading"
      @cancelled="onCancelled"
    />
  </div>
</template>
