<script setup lang="ts">
import type { DiyProduct } from '@/types/diy'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const route = useRoute()
const { fetchProduct, peekProduct } = useDiyProducts()
const product = ref<DiyProduct | null>(peekProduct(String(route.params.id)))
const loading = ref(!product.value)

onMounted(async () => {
  try {
    product.value = await fetchProduct(String(route.params.id), { force: true })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <p v-if="loading" class="text-sm text-muted-foreground">Loading…</p>
    <p v-else-if="!product" class="text-sm text-muted-foreground">Listing not found.</p>
    <DiyProductWizard
      v-else
      :product="product"
      @submitted="navigateTo('/collector/market/listings')"
    />
  </div>
</template>
