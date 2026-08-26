<script setup lang="ts">
import type { DiyOrder } from '@/types/diy'

definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})

const { fetchOrders, peekOrders } = useDiyOrders()
const { diyTick } = useRealtimeTicks()
const orders = ref<DiyOrder[]>(peekOrders() ?? [])
const loading = ref(orders.value.length === 0 && peekOrders() === null)

async function load(force = false) {
  const hadCache = peekOrders() !== null
  if (!hadCache) loading.value = true
  try {
    orders.value = await fetchOrders({ force })
  } catch {
    if (!hadCache) orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
watch(diyTick, () => { void load(true) })
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">My DIY orders</h1>
    <DiyMarketTabs
      :items="[
        { label: 'Shop', to: '/resident/market' },
        { label: 'Cart', to: '/resident/market/cart' },
        { label: 'My orders', to: '/resident/market/orders' },
      ]"
    />
    <p v-if="loading" class="text-sm text-muted-foreground">Loading orders…</p>
    <div
      v-else-if="orders.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No DIY orders yet</p>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink v-for="order in orders" :key="order.id" :to="`/resident/market/orders/${order.id}`">
        <DiyOrderCard :order="order" />
      </NuxtLink>
    </div>
  </div>
</template>
