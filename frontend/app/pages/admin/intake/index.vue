<script setup lang="ts">
import type { Listing } from '@/types/listings'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { fetchIntakeQueue } = useAdminListings()
const listings = ref<Listing[]>([])
const loading = ref(true)
const { listingsTick } = useRealtimeTicks()

async function loadQueue() {
  try {
    listings.value = await fetchIntakeQueue()
  } catch {
    listings.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => loadQueue())

watch(listingsTick, () => {
  void loadQueue()
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Intake
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Weigh scheduled pickups, confirm hazard tier, and release resident payout.
    </p>
    <IntakeQueue :listings="listings" :loading="loading" />
  </div>
</template>
