<script setup lang="ts">
import type { Listing, ListingStatus } from '@/types/listings'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { fetchAllListings, peekAllListings } = useAdminListings()
const listings = ref<Listing[]>(peekAllListings() ?? [])
const loading = ref(listings.value.length === 0 && peekAllListings() === null)
const { listingsTick } = useRealtimeTicks()

const statusFilter = ref<ListingStatus | 'all'>('all')
const categoryFilter = ref('all')
const query = ref('')

const filteredListings = computed(() => {
  const needle = query.value.trim().toLowerCase()

  return listings.value.filter((listing) => {
    if (statusFilter.value !== 'all' && listing.status !== statusFilter.value) {
      return false
    }

    const categoryCode = listing.category_code || 'uncategorized'
    if (categoryFilter.value !== 'all' && categoryCode !== categoryFilter.value) {
      return false
    }

    if (needle) {
      const name = listing.resident?.full_name?.toLowerCase() ?? ''
      const category = (
        listing.rate_card_categories?.name
        || listing.category_code
        || ''
      ).toLowerCase()
      if (!name.includes(needle) && !category.includes(needle)) {
        return false
      }
    }

    return true
  })
})

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
    <p class="mt-1.5 mb-4 text-sm text-muted-foreground">
      Every resident listing, from draft through payout.
    </p>
    <AdminActivityFilters
      v-model:status="statusFilter"
      v-model:category="categoryFilter"
      v-model:query="query"
      :listings="listings"
    />
    <AdminActivityList :listings="filteredListings" :loading="loading" />
  </div>
</template>
