<script setup lang="ts">
import type { Listing } from '@/types/listings'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const { fetchCatalog, peekCatalog } = useCollectorStock()
const listings = ref<Listing[]>(peekCatalog() ?? [])
const loading = ref(listings.value.length === 0 && peekCatalog() === null)
const { listingsTick } = useRealtimeTicks()

async function loadCatalog(force = false) {
  const hadCache = peekCatalog() !== null
  if (!hadCache) {
    loading.value = true
  }

  try {
    listings.value = await fetchCatalog({ force })
  } catch {
    if (!hadCache) {
      listings.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadCatalog())

watch(listingsTick, () => {
  void loadCatalog(true)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Browse
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Cleared company stock. Resident identity is never shown.
    </p>

    <div v-if="loading" class="text-sm text-muted-foreground">
      Loading stock…
    </div>
    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No stock right now</p>
      <p class="mt-1 text-sm text-muted-foreground">
        New lots appear after admin intake and payout.
      </p>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="listing in listings"
        :key="listing.id"
        :to="`/collector/browse/${listing.id}`"
      >
        <CollectorStockCard :listing="listing" />
      </NuxtLink>
    </div>
  </div>
</template>
