<script setup lang="ts">
import type { DiyOrder } from '@/types/diy'
import { formatListingDate, formatPeso } from '@/utils/listings/format'

defineProps<{
  order: DiyOrder
}>()
</script>

<template>
  <div class="rounded-2xl border border-neutral-200 bg-white p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold">{{ order.title }}</p>
        <DiyStatusBadge kind="order" :status="order.status" class="mt-1.5" />
      </div>
      <p class="text-sm font-semibold">{{ formatPeso(order.total_amount) }}</p>
    </div>
    <p class="mt-3 text-xs text-muted-foreground">
      {{ order.quantity }} × {{ formatPeso(order.unit_price) }}
      · {{ order.payment_method === 'gcash' ? 'GCash' : 'Cash' }}
      · {{ order.fulfillment_method === 'delivery' ? 'Delivery' : 'Pickup' }}
    </p>
    <p class="mt-1 text-xs text-muted-foreground">
      {{ formatListingDate(order.created_at) }}
    </p>
  </div>
</template>
