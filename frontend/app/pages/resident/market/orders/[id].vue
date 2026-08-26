<script setup lang="ts">
import type { DiyOrder } from '@/types/diy'

definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
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
      v-else-if="order"
      :order="order"
      mode="resident"
      back-to="/resident/market/orders"
    />
  </div>
</template>
