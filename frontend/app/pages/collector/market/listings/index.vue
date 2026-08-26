<script setup lang="ts">
import type { DiyProduct } from '@/types/diy'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const { fetchMyListings, peekMyListings } = useDiyProducts()
const { diyTick } = useRealtimeTicks()
const listings = ref<DiyProduct[]>(peekMyListings() ?? [])
const loading = ref(listings.value.length === 0 && peekMyListings() === null)

async function load(force = false) {
  const hadCache = peekMyListings() !== null
  if (!hadCache) loading.value = true
  try {
    listings.value = await fetchMyListings({ force })
  } catch {
    if (!hadCache) listings.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
watch(diyTick, () => { void load(true) })
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">My listings</h1>
        <p class="mt-1.5 text-sm text-muted-foreground">Drafts, reviews, and live pieces.</p>
      </div>
    </div>
    <DiyMarketTabs
      :items="[
        { label: 'Shop', to: '/collector/market' },
        { label: 'Sell', to: '/collector/market/new' },
        { label: 'My listings', to: '/collector/market/listings' },
        { label: 'Orders', to: '/collector/market/orders' },
      ]"
    />
    <Button as-child class="mb-4 h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90">
      <NuxtLink to="/collector/market/new">List a new piece</NuxtLink>
    </Button>
    <p v-if="loading" class="text-sm text-muted-foreground">Loading listings…</p>
    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No listings yet</p>
      <p class="mt-1 text-sm text-muted-foreground">Turn claimed e-waste into something residents can buy.</p>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="product in listings"
        :key="product.id"
        :to="product.status === 'draft' || product.status === 'rejected'
          ? `/collector/market/listings/${product.id}`
          : `/collector/market/${product.id}`"
      >
        <DiyProductCard :product="product" show-status />
      </NuxtLink>
    </div>
  </div>
</template>
