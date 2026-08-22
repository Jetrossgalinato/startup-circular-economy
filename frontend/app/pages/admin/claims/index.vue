<script setup lang="ts">
import type { Listing } from '@/types/listings'

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
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Claims
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Collector claims on company stock. Pickup at the cross-dock or delivery to their address.
    </p>
    <AdminClaimsList :listings="listings" :loading="loading" />
  </div>
</template>
