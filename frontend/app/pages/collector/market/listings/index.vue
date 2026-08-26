<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { DiyProduct } from '@/types/diy'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const { fetchMyListings, peekMyListings, deleteProduct, hideProduct } = useDiyProducts()
const { diyTick } = useRealtimeTicks()
const listings = ref<DiyProduct[]>(peekMyListings() ?? [])
const loading = ref(listings.value.length === 0 && peekMyListings() === null)
const removingId = ref<string | null>(null)

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

function listingTo(product: DiyProduct) {
  return product.status === 'draft' || product.status === 'rejected'
    ? `/collector/market/listings/${product.id}`
    : `/collector/market/${product.id}`
}

function canDelete(product: DiyProduct) {
  return product.status === 'draft' || product.status === 'rejected' || product.status === 'hidden'
}

async function removeListing(product: DiyProduct) {
  const hardDelete = canDelete(product)
  const ok = window.confirm(
    hardDelete
      ? `Remove “${product.title}”? This cannot be undone.`
      : `Unpublish “${product.title}”? It will leave the market.`,
  )
  if (!ok) return

  removingId.value = product.id
  try {
    if (hardDelete) {
      await deleteProduct(product.id)
      toast.success('Listing removed')
    } else {
      await hideProduct(product.id)
      toast.success('Listing unpublished')
    }
    await load(true)
  } catch (error) {
    toast.error('Could not remove listing', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    removingId.value = null
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
    <div v-else class="space-y-4">
      <div
        v-for="product in listings"
        :key="product.id"
        class="space-y-2"
      >
        <NuxtLink :to="listingTo(product)">
          <DiyProductCard :product="product" show-status />
        </NuxtLink>
        <Button
          type="button"
          variant="outline"
          class="h-10 w-full rounded-full border-neutral-200"
          :disabled="removingId === product.id"
          @click="removeListing(product)"
        >
          {{ removingId === product.id
            ? 'Removing…'
            : canDelete(product) ? 'Remove listing' : 'Unpublish listing' }}
        </Button>
      </div>
    </div>
  </div>
</template>
