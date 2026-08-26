<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { DiyCartItem } from '@/types/diy'
import { formatPeso } from '@/utils/listings/format'

definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})

const { fetchCart, peekCart, updateQuantity, removeItem } = useDiyCart()
const { diyTick } = useRealtimeTicks()
const items = ref<DiyCartItem[]>(peekCart() ?? [])
const loading = ref(items.value.length === 0 && peekCart() === null)
const checkoutItem = ref<DiyCartItem | null>(null)

async function load(force = false) {
  const hadCache = peekCart() !== null
  if (!hadCache) loading.value = true
  try {
    items.value = await fetchCart({ force })
  } catch {
    if (!hadCache) items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
watch(diyTick, () => { void load(true) })

async function changeQty(item: DiyCartItem, quantity: number) {
  try {
    items.value = await updateQuantity(item.id, quantity)
  } catch (error) {
    toast.error('Could not update cart', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Cart</h1>
    <p class="mt-1.5 text-sm text-muted-foreground">
      Saved items. Checkout one product at a time.
    </p>
    <DiyMarketTabs
      :items="[
        { label: 'Shop', to: '/resident/market' },
        { label: 'Cart', to: '/resident/market/cart' },
        { label: 'My orders', to: '/resident/market/orders' },
      ]"
    />
    <p v-if="loading" class="text-sm text-muted-foreground">Loading cart…</p>
    <div
      v-else-if="items.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">Cart is empty</p>
      <p class="mt-1 text-sm text-muted-foreground">Save a piece from the market, then place an order here.</p>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-2xl border border-neutral-200 p-4"
      >
        <p class="text-sm font-semibold">{{ item.product?.title || 'Item' }}</p>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ item.product ? formatPeso(item.product.price) : '—' }}
          · stock {{ item.product?.stock ?? 0 }}
        </p>
        <div class="mt-3 flex items-center gap-3">
          <Button variant="outline" class="size-9 rounded-full" @click="changeQty(item, item.quantity - 1)">−</Button>
          <span class="text-sm font-semibold">{{ item.quantity }}</span>
          <Button variant="outline" class="size-9 rounded-full" @click="changeQty(item, item.quantity + 1)">+</Button>
        </div>
        <div class="mt-3 flex gap-2">
          <Button
            class="h-10 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
            :disabled="!item.product || item.product.status !== 'active' || item.product.stock < 1"
            @click="checkoutItem = item"
          >
            Place order
          </Button>
          <Button variant="outline" class="h-10 rounded-full" @click="changeQty(item, 0)">
            Remove
          </Button>
        </div>
      </div>
    </div>

    <DiyCheckoutSheet
      v-if="checkoutItem?.product"
      :product="checkoutItem.product"
      :open="!!checkoutItem"
      @update:open="checkoutItem = $event ? checkoutItem : null"
      @placed="checkoutItem = null; navigateTo('/resident/market/orders')"
    />
  </div>
</template>
