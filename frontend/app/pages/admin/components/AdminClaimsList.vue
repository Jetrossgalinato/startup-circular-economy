<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { FULFILLMENT_LABELS } from '@/types/listings'
import { toast } from 'vue-sonner'
import { formatListingDate, formatPeso } from '@/utils/listings/format'
import { claimBadgeLabel, isPendingClaim } from '@/utils/listings/claims'

defineProps<{
  listings: Listing[]
  loading?: boolean
}>()

const emit = defineEmits<{
  updated: [listing: Listing]
}>()

const { confirmClaim, rejectClaim } = useAdminClaims()
const busyId = ref<string | null>(null)

async function confirm(listing: Listing) {
  if (busyId.value) {
    return
  }
  busyId.value = listing.id
  try {
    emit('updated', await confirmClaim(listing.id))
  } catch (error) {
    toast.error('Could not confirm claim', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  } finally {
    busyId.value = null
  }
}

async function reject(listing: Listing) {
  if (busyId.value) {
    return
  }
  busyId.value = listing.id
  try {
    emit('updated', await rejectClaim(listing.id))
  } catch (error) {
    toast.error('Could not reject claim', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="loading" class="text-sm text-muted-foreground">
      Loading claims…
    </div>
    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No claims yet</p>
      <p class="mt-1 text-sm text-muted-foreground">
        New collector claims will show up here.
      </p>
    </div>
    <div
      v-for="listing in listings"
      :key="listing.id"
      class="rounded-2xl border border-neutral-200 bg-white p-4"
    >
      <NuxtLink :to="`/admin/activity/${listing.id}`" class="block">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">
              {{ listing.rate_card_categories?.name || listing.category_code || 'Item' }}
            </p>
            <ActivityStatusBadge
              :status="listing.status"
              :label="claimBadgeLabel(listing)"
              class="mt-1.5"
            />
          </div>
          <p class="text-sm font-semibold">
            {{ listing.final_amount != null ? formatPeso(listing.final_amount) : '—' }}
          </p>
        </div>
        <p class="mt-3 text-sm text-foreground">
          {{ listing.fulfillment_method
            ? FULFILLMENT_LABELS[listing.fulfillment_method]
            : 'Claimed' }}
        </p>
        <p
          v-if="listing.fulfillment_method === 'delivery' && listing.delivery_address"
          class="mt-1 whitespace-pre-wrap text-sm text-muted-foreground"
        >
          {{ listing.delivery_address }}
        </p>
        <p class="mt-1 text-xs text-muted-foreground">
          {{ formatListingDate(listing.claimed_at || listing.created_at) }}
          <span v-if="listing.weight_kg != null"> · {{ listing.weight_kg }} kg</span>
        </p>
      </NuxtLink>
      <div v-if="isPendingClaim(listing)" class="mt-3 flex gap-2">
        <Button
          type="button"
          class="h-10 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
          :disabled="busyId === listing.id"
          @click="confirm(listing)"
        >
          {{ busyId === listing.id ? 'Saving…' : 'Confirm' }}
        </Button>
        <Button
          type="button"
          variant="outline"
          class="h-10 flex-1 rounded-full"
          :disabled="busyId === listing.id"
          @click="reject(listing)"
        >
          Reject
        </Button>
      </div>
    </div>
  </div>
</template>
