<script setup lang="ts">
import { toast } from 'vue-sonner'
import { diyCategoryLabel } from '@/constants/diy'
import type { DiyProduct } from '@/types/diy'
import { formatPeso } from '@/utils/listings/format'

const props = defineProps<{
  product: DiyProduct
  backTo: string
  mode: 'resident' | 'collector' | 'admin'
}>()

const { user } = useAuth()
const { addToCart } = useDiyCart()
const { hideProduct, approveProduct, rejectProduct } = useDiyProducts()

const checkoutOpen = ref(false)
const rejectReason = ref('')
const busy = ref(false)

const isOwn = computed(() => props.product.collector_id === user.value?.id)
const canBuy = computed(() => props.mode === 'resident' && props.product.status === 'active' && props.product.stock > 0)
const photos = computed(() => props.product.diy_product_photos ?? [])

async function saveToCart() {
  try {
    await addToCart(props.product)
    toast.success('Saved to cart', {
      description: 'Open Cart to place this order when you are ready.',
    })
  } catch (error) {
    toast.error('Could not add to cart', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  }
}

async function run(action: () => Promise<unknown>, success: string, description: string) {
  if (busy.value) return
  busy.value = true
  try {
    await action()
    toast.success(success, { description })
  } catch (error) {
    toast.error('Could not update', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink :to="backTo" class="text-sm text-muted-foreground underline underline-offset-2">
      ← Back
    </NuxtLink>

    <div v-if="photos.some((photo) => photo.signed_url)" class="mt-4 flex gap-2 overflow-x-auto">
      <img
        v-for="photo in photos"
        :key="photo.id"
        :src="photo.signed_url"
        :alt="product.title"
        class="h-28 w-28 shrink-0 rounded-2xl object-cover"
      >
    </div>

    <div class="mt-4 rounded-[1.5rem] border border-neutral-200 p-5">
      <p class="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Made from e-waste
      </p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight">{{ product.title }}</h1>
      <DiyStatusBadge kind="product" :status="product.status" class="mt-2" />
      <p class="mt-3 text-sm text-muted-foreground">
        {{ diyCategoryLabel(product.category) }}
        <span v-if="product.collector_name"> · {{ product.collector_name }}</span>
      </p>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Price</p>
        <p class="mt-1 text-lg font-semibold">{{ formatPeso(product.price) }}</p>
      </div>
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Stock</p>
        <p class="mt-1 text-lg font-semibold">{{ product.stock }}</p>
      </div>
    </div>

    <p class="mt-4 whitespace-pre-wrap text-sm leading-6">{{ product.description }}</p>
    <div class="mt-4 rounded-2xl border border-neutral-200 p-4">
      <p class="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">E-waste source</p>
      <p class="mt-1 text-sm">{{ product.ewaste_source || '—' }}</p>
    </div>

    <div v-if="canBuy" class="mt-6 space-y-2">
      <Button class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90" @click="checkoutOpen = true">
        Buy now
      </Button>
      <Button variant="outline" class="h-11 w-full rounded-full" @click="saveToCart">
        Add to cart
      </Button>
    </div>

    <p v-else-if="mode === 'resident' && product.stock < 1" class="mt-6 text-sm text-muted-foreground">
      Sold out.
    </p>

    <div v-if="mode === 'collector' && isOwn" class="mt-6 space-y-2">
      <Button as-child class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90">
        <NuxtLink :to="`/collector/market/listings/${product.id}`">Edit listing</NuxtLink>
      </Button>
      <Button
        v-if="product.status === 'active'"
        type="button"
        variant="outline"
        class="h-11 w-full rounded-full"
        :disabled="busy"
        @click="run(() => hideProduct(product.id), 'Listing hidden', 'This piece is no longer in the market.')"
      >
        Unpublish
      </Button>
    </div>

    <div v-if="mode === 'admin'" class="mt-6 space-y-3">
      <template v-if="product.status === 'pending_review'">
        <Button
          class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90"
          :disabled="busy"
          @click="run(() => approveProduct(product.id), 'Listing is live', 'Residents can now buy this piece.')"
        >
          Approve
        </Button>
        <textarea
          v-model="rejectReason"
          rows="2"
          class="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          placeholder="Rejection reason (optional)"
        />
        <Button
          type="button"
          variant="outline"
          class="h-11 w-full rounded-full"
          :disabled="busy"
          @click="run(() => rejectProduct(product.id, rejectReason), 'Listing rejected', 'The collector can edit and submit it again.')"
        >
          Reject
        </Button>
      </template>
      <Button
        v-else-if="product.status === 'active'"
        type="button"
        variant="outline"
        class="h-11 w-full rounded-full"
        :disabled="busy"
        @click="run(() => hideProduct(product.id), 'Listing hidden', 'This piece is no longer in the market.')"
      >
        Hide listing
      </Button>
    </div>

    <DiyCheckoutSheet
      v-if="mode === 'resident'"
      :product="product"
      :open="checkoutOpen"
      @update:open="checkoutOpen = $event"
      @placed="navigateTo('/resident/market/orders')"
    />
  </div>
</template>
