<script setup lang="ts">
import type { AdminOpsSummary } from '@/composables/useAdminListings'

defineProps<{
  summary: AdminOpsSummary
  loading?: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    <div class="rounded-[1.5rem] bg-[#dce8ee] p-4">
      <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
        QUEUE
      </p>
      <p class="mt-1 text-3xl font-bold tracking-tight">
        {{ loading ? '—' : summary.scheduled }}
      </p>
      <p class="mt-0.5 text-xs text-foreground/70">
        Pickups scheduled
      </p>
    </div>
    <div class="rounded-[1.5rem] bg-[#ead9c4] p-4">
      <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
        WEIGHED
      </p>
      <p class="mt-1 text-3xl font-bold tracking-tight">
        {{ loading ? '—' : summary.weighed }}
      </p>
      <p class="mt-0.5 text-xs text-foreground/70">
        Awaiting payout
      </p>
    </div>
    <div class="rounded-[1.5rem] bg-[#dceee4] p-4">
      <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
        PAID
      </p>
      <p class="mt-1 text-3xl font-bold tracking-tight">
        {{ loading ? '—' : summary.paidToday }}
      </p>
      <p class="mt-0.5 text-xs text-foreground/70">
        Released today
      </p>
    </div>
  </div>
</template>
