<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { toast } from 'vue-sonner'
import { formatPeso, formatRatePerKg } from '@/utils/listings/format'
import { claimBadgeLabel, isConfirmedClaim, isPendingClaim } from '@/utils/listings/claims'

const props = defineProps<{
  listing: Listing
}>()

const emit = defineEmits<{
  updated: [listing: Listing]
}>()

const { confirmClaim, rejectClaim } = useAdminClaims()
const busy = ref(false)

async function confirm() {
  if (busy.value) {
    return
  }
  busy.value = true
  try {
    emit('updated', await confirmClaim(props.listing.id))
  } catch (error) {
    toast.error('Could not confirm claim', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  } finally {
    busy.value = false
  }
}

async function reject() {
  if (busy.value) {
    return
  }
  busy.value = true
  try {
    emit('updated', await rejectClaim(props.listing.id))
  } catch (error) {
    toast.error('Could not reject claim', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  } finally {
    busy.value = false
  }
}

const { getSignedUrls } = useListingUpload()
const photos = ref(props.listing.listing_photos ?? [])

onMounted(async () => {
  try {
    photos.value = await getSignedUrls(props.listing.listing_photos ?? [])
  } catch {
    photos.value = props.listing.listing_photos ?? []
  }
})
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

    <div
      v-if="photos.some((photo) => photo.signed_url)"
      class="flex gap-2 overflow-x-auto"
    >
      <img
        v-for="photo in photos"
        :key="photo.id"
        :src="photo.signed_url"
        alt="Listing photo"
        class="h-24 w-24 shrink-0 rounded-2xl object-cover"
      >
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Hazard tier</p>
        <p class="mt-1 text-lg font-semibold">
          {{ listing.hazard_tier ? `Tier ${listing.hazard_tier}` : '—' }}
        </p>
      </div>
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Resale</p>
        <p class="mt-1 text-lg font-semibold">
          {{ listing.resale_eligible ? 'Collector stock' : 'Not listed' }}
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
      <p class="text-sm font-semibold">Resident (admin only)</p>
      <p class="mt-1 text-sm text-foreground">
        {{ listing.resident?.full_name || '—' }}
      </p>
      <p v-if="listing.resident?.phone" class="text-sm text-muted-foreground">
        {{ listing.resident.phone }}
      </p>
      <p class="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">
        {{ listing.pickup_address || listing.resident?.address || 'No pickup address' }}
      </p>
      <p class="mt-2 text-sm text-muted-foreground capitalize">
        Payout: {{ listing.payout_method || '—' }}
        <template v-if="listing.payout_method === 'gcash' && listing.gcash_number">
          · {{ listing.gcash_number }}
        </template>
      </p>
      <p class="mt-1 text-sm text-muted-foreground">
        Rate: {{ formatRatePerKg(listing.quoted_rate_per_kg) }}
      </p>
    </div>

    <div v-if="listing.status === 'claimed'" class="rounded-2xl border border-neutral-200 p-4">
      <p class="text-sm font-semibold">Collector claim</p>
      <p class="mt-1 text-sm text-foreground">
        {{ listing.fulfillment_method === 'delivery' ? 'Delivery' : 'Pickup at cross-dock' }}
      </p>
      <p
        v-if="listing.fulfillment_method === 'delivery' && listing.delivery_address"
        class="mt-1 whitespace-pre-wrap text-sm text-muted-foreground"
      >
        {{ listing.delivery_address }}
      </p>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ isConfirmedClaim(listing)
          ? 'Confirmed for this collector.'
          : 'Waiting for confirm or reject.' }}
      </p>
      <div v-if="isPendingClaim(listing)" class="mt-3 flex gap-2">
        <Button
          type="button"
          class="h-10 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
          :disabled="busy"
          @click="confirm"
        >
          {{ busy ? 'Saving…' : 'Confirm' }}
        </Button>
        <Button
          type="button"
          variant="outline"
          class="h-10 flex-1 rounded-full"
          :disabled="busy"
          @click="reject"
        >
          Reject
        </Button>
      </div>
    </div>

    <Button
      v-if="listing.status === 'pickup_scheduled'"
      as-child
      size="lg"
      class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90"
    >
      <NuxtLink :to="`/admin/intake/${listing.id}`">
        Open intake
      </NuxtLink>
    </Button>
  </div>
</template>
