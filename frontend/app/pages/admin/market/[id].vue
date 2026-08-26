<script setup lang="ts">
import type { DiyProduct } from '@/types/diy'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const { fetchProduct, peekProduct } = useDiyProducts()
const { diyTick } = useRealtimeTicks()

const product = ref<DiyProduct | null>(peekProduct(id.value))
const loading = ref(!product.value)

async function load(force = false) {
  try {
    product.value = await fetchProduct(id.value, { force })
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
watch([id, diyTick], () => { void load(true) })
</script>

<template>
  <div>
    <p v-if="loading" class="text-sm text-muted-foreground">Loading…</p>
    <p v-else-if="!product" class="text-sm text-muted-foreground">Product not found.</p>
    <DiyProductDetail
      v-else
      :product="product"
      back-to="/admin/market"
      mode="admin"
    />
  </div>
</template>
