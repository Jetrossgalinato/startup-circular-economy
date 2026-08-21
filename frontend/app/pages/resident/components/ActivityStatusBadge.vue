<script setup lang="ts">
import type { ListingStatus } from '@/types/listings'
import { LISTING_STATUS_LABELS } from '@/types/listings'
import { cn } from '@/lib/utils'

const props = defineProps<{
  status: ListingStatus
  class?: string
}>()

const tone = computed(() => {
  switch (props.status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-900'
    case 'refused':
    case 'cancelled':
      return 'bg-red-100 text-red-900'
    case 'pickup_scheduled':
    case 'weighed':
      return 'bg-[#dce8ee] text-foreground'
    case 'awaiting_acceptance':
    case 'accepted':
      return 'bg-[#ead9c4] text-foreground'
    default:
      return 'bg-neutral-100 text-foreground'
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
    {{ LISTING_STATUS_LABELS[status] }}
  </span>
</template>
