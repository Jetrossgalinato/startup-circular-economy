<script setup lang="ts">
import type { ListingStatus } from '@/types/listings'
import { LISTING_STATUS_LABELS } from '@/types/listings'
import { cn } from '@/lib/utils'

const props = defineProps<{
  status: ListingStatus
  label?: string
  class?: string
}>()

const displayLabel = computed(() => props.label || LISTING_STATUS_LABELS[props.status])

const tone = computed(() => {
  if (props.label === 'Pending') {
    return 'bg-amber-100 text-amber-950'
  }
  if (props.label === 'Confirmed') {
    return 'bg-teal-100 text-teal-900'
  }

  switch (props.status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-900'
    case 'claimed':
      return 'bg-teal-100 text-teal-900'
    case 'refused':
    case 'cancelled':
      return 'bg-red-100 text-red-900'
    case 'pickup_scheduled':
      return 'bg-sky-100 text-sky-900'
    case 'weighed':
      return 'bg-violet-100 text-violet-900'
    case 'awaiting_acceptance':
      return 'bg-amber-100 text-amber-950'
    case 'accepted':
      return 'bg-[#ead9c4] text-foreground'
    case 'triaging':
      return 'bg-sky-100 text-sky-900'
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
    {{ displayLabel }}
  </span>
</template>
