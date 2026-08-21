<script setup lang="ts">
import type { Listing, RateCardCategory } from '@/types/listings'

definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})

const { profile } = useAuth()
const { fetchMyListings, peekListings } = useListings()
const { fetchCategories, peekCategories } = useRateCard()

const listings = ref<Listing[]>(peekListings() ?? [])
const categories = ref<RateCardCategory[]>(peekCategories() ?? [])
const loading = ref(listings.value.length === 0 && categories.value.length === 0)

const activeCount = computed(() =>
  listings.value.filter((l) =>
    !['paid', 'refused', 'cancelled'].includes(l.status),
  ).length,
)

const recent = computed(() => listings.value.slice(0, 3))

onMounted(async () => {
  try {
    const [nextListings, nextCategories] = await Promise.all([
      fetchMyListings(),
      fetchCategories(),
    ])
    listings.value = nextListings
    categories.value = nextCategories
  } catch {
    // Keep any peeked cache on failure
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <HomeSummary
      :name="profile?.full_name || 'Resident'"
      :active-count="activeCount"
      :recent="recent"
    />
    <RateCardTeaser v-if="categories.length" :categories="categories" />
    <p v-else-if="!loading" class="mt-8 text-sm text-muted-foreground">
      Rate card will appear once categories are available.
    </p>
  </div>
</template>
