<script setup lang="ts">
import { diyCategoryLabel } from '@/constants/diy'
import type { DiyProduct } from '@/types/diy'
import { formatPeso } from '@/utils/listings/format'

defineProps<{
  product: DiyProduct
  showStatus?: boolean
  to?: string
}>()
</script>

<template>
  <div class="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white">
    <component
      :is="to ? 'NuxtLink' : 'div'"
      :to="to"
      class="block"
    >
      <div class="aspect-[4/3] bg-neutral-100">
        <img
          v-if="product.diy_product_photos?.[0]?.signed_url"
          :src="product.diy_product_photos[0].signed_url"
          :alt="product.title"
          class="size-full object-cover"
        >
        <div v-else class="flex size-full items-center justify-center text-xs text-muted-foreground">
          No photo
        </div>
      </div>
      <div class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">{{ product.title }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              {{ diyCategoryLabel(product.category) }}
              <span v-if="product.collector_name"> · {{ product.collector_name }}</span>
            </p>
          </div>
          <p class="text-sm font-semibold">{{ formatPeso(product.price) }}</p>
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <DiyStatusBadge v-if="showStatus" kind="product" :status="product.status" />
          <span class="text-xs text-muted-foreground">
            {{ product.stock > 0 ? `${product.stock} in stock` : 'Sold out' }}
          </span>
        </div>
      </div>
    </component>
    <div
      v-if="$slots.footer"
      class="border-t border-neutral-100 px-4 py-3"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
