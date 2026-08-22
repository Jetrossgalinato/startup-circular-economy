<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { canCancelListing } from '@/types/listings'
import { formatPeso, formatRatePerKg } from '@/utils/listings/format'
import { claimBadgeLabel } from '@/utils/listings/claims'

defineProps<{
  listing: Listing
  cancelling?: boolean
}>()

const emit = defineEmits<{
  cancel: []
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-[1.5rem] border border-neutral-200 p-5">
      <p class="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Listing
      </p>
      <h2 class="mt-1 text-xl font-bold tracking-tight">
        {{ listing.rate_card_categories?.name || listing.category_code || 'Item' }}
      </h2>
      <ActivityStatusBadge
        :status="listing.status"
        :label="claimBadgeLabel(listing)"
        class="mt-2"
      />
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Hazard tier</p>
        <p class="mt-1 text-lg font-semibold">
          {{ listing.hazard_tier ? `Tier ${listing.hazard_tier}` : '—' }}
        </p>
      </div>
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Rate</p>
        <p class="mt-1 text-lg font-semibold">
          {{ formatRatePerKg(listing.quoted_rate_per_kg) }}
        </p>
      </div>
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Weight</p>
        <p class="mt-1 text-lg font-semibold">
          {{ listing.weight_kg != null ? `${listing.weight_kg} kg` : 'Pending weigh-in' }}
        </p>
      </div>
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Payout</p>
        <p class="mt-1 text-lg font-semibold">
          {{ listing.final_amount != null ? formatPeso(listing.final_amount) : 'After weigh-in' }}
        </p>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200 p-4">
      <p class="text-sm font-semibold">Payment</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Method:
        <span class="font-medium text-foreground capitalize">
          {{ listing.payout_method || '—' }}
        </span>
        <template v-if="listing.payout_method === 'gcash' && listing.gcash_number">
          · {{ listing.gcash_number }}
        </template>
      </p>
      <p class="mt-1 text-sm text-muted-foreground">
        Status:
        <span class="font-medium text-foreground">
          {{ listing.status === 'paid' ? 'Released' : 'Not released yet' }}
        </span>
      </p>
    </div>

    <div v-if="listing.pickup_address" class="rounded-2xl border border-neutral-200 p-4">
      <p class="text-sm font-semibold">Pickup</p>
      <p class="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">
        {{ listing.pickup_address }}
      </p>
      <p v-if="listing.preferred_pickup_window" class="mt-2 text-sm text-muted-foreground">
        Window: {{ listing.preferred_pickup_window }}
      </p>
    </div>

    <div v-if="listing.triage_reasons?.length" class="rounded-2xl border border-neutral-200 p-4">
      <p class="text-sm font-semibold">Triage notes</p>
      <ul class="mt-2 space-y-1.5">
        <li
          v-for="reason in listing.triage_reasons"
          :key="reason"
          class="text-sm text-muted-foreground"
        >
          · {{ reason }}
        </li>
      </ul>
    </div>

    <Button
      v-if="canCancelListing(listing.status)"
      type="button"
      variant="outline"
      size="lg"
      class="h-11 w-full rounded-full border-neutral-200"
      :disabled="cancelling"
      @click="emit('cancel')"
    >
      {{ cancelling ? 'Cancelling…' : 'Cancel listing' }}
    </Button>
  </div>
</template>
