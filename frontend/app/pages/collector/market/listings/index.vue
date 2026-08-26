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
const pendingProduct = ref<DiyProduct | null>(null)
const dialogOpen = ref(false)
const submitting = ref(false)

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
  if (product.has_orders) {
    return false
  }
  return product.status === 'draft' || product.status === 'rejected' || product.status === 'hidden'
}

function showFooterAction(product: DiyProduct) {
  if (product.status === 'hidden' && product.has_orders) {
    return false
  }
  return true
}

function openRemove(product: DiyProduct) {
  pendingProduct.value = product
  dialogOpen.value = true
}

async function confirmRemove() {
  const product = pendingProduct.value
  if (!product || submitting.value) return

  const hardDelete = canDelete(product)
  submitting.value = true
  try {
    if (hardDelete) {
      await deleteProduct(product.id)
      toast.success('Listing removed', {
        description: 'This piece is gone from My listings.',
      })
    } else {
      await hideProduct(product.id)
      toast.success('Listing unpublished', {
        description: 'It is hidden from the market until you list it again.',
      })
    }
    dialogOpen.value = false
    pendingProduct.value = null
    await load(true)
  } catch (error) {
    toast.error('Could not remove listing', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    submitting.value = false
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
    <Button as-child class="mb-5 h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90">
      <NuxtLink to="/collector/market/new">List a new piece</NuxtLink>
    </Button>
    <p v-if="loading" class="text-sm text-muted-foreground">Loading listings…</p>
    <div
      v-else-if="listings.length === 0"
      class="rounded-[1.5rem] border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No listings yet</p>
      <p class="mt-1 text-sm text-muted-foreground">Turn claimed e-waste into something residents can buy.</p>
    </div>
    <div v-else class="space-y-4">
      <DiyProductCard
        v-for="product in listings"
        :key="product.id"
        :product="product"
        :to="listingTo(product)"
        show-status
      >
        <template v-if="showFooterAction(product)" #footer>
          <Button
            type="button"
            variant="outline"
            class="h-10 w-full rounded-full"
            :class="canDelete(product)
              ? 'border-red-200 text-red-700 hover:bg-red-50'
              : 'border-neutral-200 text-foreground/80'"
            :disabled="submitting && pendingProduct?.id === product.id"
            @click="openRemove(product)"
          >
            {{ canDelete(product) ? 'Remove listing' : 'Unpublish listing' }}
          </Button>
        </template>
      </DiyProductCard>
    </div>

    <DiyRemoveListingDialog
      v-model:open="dialogOpen"
      :mode="pendingProduct && canDelete(pendingProduct) ? 'delete' : 'unpublish'"
      :title="pendingProduct?.title"
      :submitting="submitting"
      @confirm="confirmRemove"
    />
  </div>
</template>
