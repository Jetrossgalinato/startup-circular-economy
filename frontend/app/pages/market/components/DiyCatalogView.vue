<script setup lang="ts">
import { DIY_CATEGORIES } from '@/constants/diy'
import type { DiyCategory, DiyProduct } from '@/types/diy'

const props = defineProps<{
  basePath: string
  showStatus?: boolean
  emptyTitle?: string
  emptyBody?: string
}>()

const { fetchCatalog, peekCatalog } = useDiyProducts()
const { diyTick } = useRealtimeTicks()

const products = ref<DiyProduct[]>(peekCatalog() ?? [])
const loading = ref(products.value.length === 0)
const category = ref<DiyCategory | 'all'>('all')

const filtered = computed(() => {
  if (category.value === 'all') return products.value
  return products.value.filter((item) => item.category === category.value)
})

async function load(force = false) {
  const hadCache = peekCatalog() !== null
  if (!hadCache) loading.value = true
  try {
    products.value = await fetchCatalog({ force })
  } catch {
    if (!hadCache) products.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
watch(diyTick, () => { void load(true) })
</script>

<template>
  <div>
    <div class="mb-4 flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
        :class="category === 'all' ? 'border-foreground bg-foreground text-white' : 'border-neutral-200'"
        @click="category = 'all'"
      >
        All
      </button>
      <button
        v-for="option in DIY_CATEGORIES"
        :key="option.value"
        type="button"
        class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
        :class="category === option.value ? 'border-foreground bg-foreground text-white' : 'border-neutral-200'"
        @click="category = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <p v-if="loading" class="text-sm text-muted-foreground">Loading marketplace…</p>
    <div
      v-else-if="filtered.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">{{ emptyTitle || 'No pieces yet' }}</p>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ emptyBody || 'Upcycled e-waste products will show up here after admin review.' }}
      </p>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="product in filtered"
        :key="product.id"
        :to="`${basePath}/${product.id}`"
      >
        <DiyProductCard :product="product" :show-status="showStatus" />
      </NuxtLink>
    </div>
  </div>
</template>
