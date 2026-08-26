<script setup lang="ts">
import { DIY_ORDER_STATUS_LABELS, DIY_PRODUCT_STATUS_LABELS } from '@/constants/diy'
import type { DiyOrderStatus, DiyProductStatus } from '@/types/diy'
import { cn } from '@/lib/utils'

const props = defineProps<{
  kind: 'product' | 'order'
  status: DiyProductStatus | DiyOrderStatus
  class?: string
}>()

const label = computed(() => {
  if (props.kind === 'product') {
    return DIY_PRODUCT_STATUS_LABELS[props.status as DiyProductStatus]
  }
  return DIY_ORDER_STATUS_LABELS[props.status as DiyOrderStatus]
})

const tone = computed(() => {
  switch (props.status) {
    case 'active':
    case 'completed':
    case 'paid':
      return 'bg-emerald-100 text-emerald-900'
    case 'pending_review':
    case 'pending_payment':
    case 'ready':
      return 'bg-amber-100 text-amber-950'
    case 'out_for_delivery':
      return 'bg-sky-100 text-sky-900'
    case 'hidden':
    case 'draft':
      return 'bg-neutral-100 text-neutral-700'
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-900'
    default:
      return 'bg-neutral-100 text-neutral-700'
  }
})
</script>

<template>
  <span
    :class="cn(
      'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
      tone,
      props.class,
    )"
  >
    {{ label }}
  </span>
</template>
