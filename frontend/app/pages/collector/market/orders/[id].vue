<script setup lang="ts">
import type { DiyOrder } from '@/types/diy'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const route = useRoute()
const { fetchOrder, peekOrder } = useDiyOrders()
const { diyTick } = useRealtimeTicks()
const order = ref<DiyOrder | null>(peekOrder(String(route.params.id)))
const loading = ref(!order.value)

async function load(force = false) {
  try {
    order.value = await fetchOrder(String(route.params.id), { force })
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
watch(diyTick, () => { void load(true) })
</script>

<template>
  <div>
    <p v-if="loading" class="text-sm text-muted-foreground">Loading…</p>
    <p v-else-if="!order" class="text-sm text-muted-foreground">Order not found.</p>
    <DiyOrderDetail
      v-else
      :order="order"
      mode="collector"
      back-to="/collector/market/orders"
    />
  </div>
</template>
