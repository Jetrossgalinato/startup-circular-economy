<script setup lang="ts">
import type { DiyProduct } from '@/types/diy'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { fetchReviewQueue, peekReviewQueue } = useDiyProducts()
const { diyTick } = useRealtimeTicks()

const queue = ref<DiyProduct[]>(peekReviewQueue() ?? [])
const loading = ref(queue.value.length === 0 && peekReviewQueue() === null)

async function load(force = false) {
  const hadCache = peekReviewQueue() !== null
  if (!hadCache) loading.value = true
  try {
    queue.value = await fetchReviewQueue({ force })
  } catch {
    if (!hadCache) queue.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
watch(diyTick, () => { void load(true) })
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      DIY <span class="font-serif font-medium italic">market</span>
    </h1>
    <p class="mt-1.5 mb-1 text-sm text-muted-foreground">
      Approve collector listings before residents can buy them.
    </p>
    <DiyMarketTabs
      :items="[
        { label: 'Review', to: '/admin/market' },
        { label: 'Catalog', to: '/admin/market/catalog' },
        { label: 'Orders', to: '/admin/market/orders' },
      ]"
    />

    <p v-if="loading" class="text-sm text-muted-foreground">Loading review queue…</p>
    <div
      v-else-if="queue.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">Nothing to review</p>
      <p class="mt-1 text-sm text-muted-foreground">New collector submissions land here.</p>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink v-for="product in queue" :key="product.id" :to="`/admin/market/${product.id}`">
        <DiyProductCard :product="product" show-status />
      </NuxtLink>
    </div>
  </div>
</template>
