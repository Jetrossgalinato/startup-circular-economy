<script setup lang="ts">
import type { Listing } from '@/types/listings'

definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})

const { fetchMyListings } = useListings()
const listings = ref<Listing[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    listings.value = await fetchMyListings()
  } catch {
    listings.value = []
  } finally {
    loading.value = false
  }
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
    <ActivityList :listings="listings" :loading="loading" />
  </div>
</template>
