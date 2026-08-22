<script setup lang="ts">
import type { Listing } from '@/types/listings'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { fetchAllListings, peekAllListings } = useAdminListings()
const listings = ref<Listing[]>(peekAllListings() ?? [])
const loading = ref(listings.value.length === 0 && peekAllListings() === null)
const { listingsTick } = useRealtimeTicks()

async function loadActivity(force = false) {
  const hadCache = peekAllListings() !== null
  if (!hadCache) {
    loading.value = true
  }

  try {
    listings.value = await fetchAllListings({ force })
  } catch {
    if (!hadCache) {
      listings.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadActivity())

watch(listingsTick, () => {
  void loadActivity(true)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Activity
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Every resident listing, from draft through payout.
    </p>
    <AdminActivityList :listings="listings" :loading="loading" />
  </div>
</template>
