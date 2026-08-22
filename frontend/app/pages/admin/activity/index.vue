<script setup lang="ts">
import type { Listing } from '@/types/listings'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { fetchAllListings } = useAdminListings()
const listings = ref<Listing[]>([])
const loading = ref(true)
const { listingsTick } = useRealtimeTicks()

async function loadActivity() {
  try {
    listings.value = await fetchAllListings()
  } catch {
    listings.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => loadActivity())

watch(listingsTick, () => {
  void loadActivity()
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
