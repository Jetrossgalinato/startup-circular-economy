<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { Listing } from '@/types/listings'
import { LISTING_STATUS_LABELS, canCancelListing } from '@/types/listings'
import { formatListingDate, formatPeso, formatRatePerKg } from '@/utils/listings/format'
import { claimBadgeLabel } from '@/utils/listings/claims'

defineProps<{
  listings: Listing[]
  loading?: boolean
}>()

const emit = defineEmits<{
  cancelled: [id: string]
}>()

const { cancelListing } = useListings()
const dialogOpen = ref(false)
const targetListing = ref<Listing | null>(null)
const submitting = ref(false)

function openCancelDialog(listing: Listing, event: Event) {
  event.preventDefault()
  event.stopPropagation()

  if (!canCancelListing(listing.status) || submitting.value) {
    return
  }

  targetListing.value = listing
  dialogOpen.value = true
}

async function confirmCancel(reason: string) {
  if (!targetListing.value || submitting.value) {
    return
  }

  submitting.value = true
  try {
    await cancelListing(targetListing.value.id, reason)
    toast.success('Listing cancelled', {
      description: 'It has been removed from your active activity.',
    })
    emit('cancelled', targetListing.value.id)
    dialogOpen.value = false
    targetListing.value = null
  } catch (error) {
    toast.error('Could not cancel listing', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="loading"
      class="rounded-2xl border border-neutral-200 px-4 py-8 text-center text-sm text-muted-foreground"
    >
      Loading activity…
    </div>
    <div
      v-else-if="listings.length === 0"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center"
    >
      <p class="font-medium">No listings yet</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Sell your first e-waste item to see it here.
      </p>
      <Button
        as-child
        class="mt-4 h-10 rounded-full bg-foreground px-5 text-white hover:bg-foreground/90"
      >
        <NuxtLink to="/resident/sell">
          Sell e-waste
        </NuxtLink>
      </Button>
    </div>

    <div
      v-for="listing in listings"
      :key="listing.id"
      class="rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
    >
      <NuxtLink
        :to="`/resident/activity/${listing.id}`"
        class="block"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">
              {{ listing.rate_card_categories?.name || listing.category_code || 'Uncategorized' }}
            </p>
            <ActivityStatusBadge
              :status="listing.status"
              :label="claimBadgeLabel(listing)"
              class="mt-1.5"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            {{ formatListingDate(listing.created_at) }}
          </p>
        </div>
        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span v-if="listing.hazard_tier">Tier {{ listing.hazard_tier }}</span>
          <span v-if="listing.quoted_rate_per_kg">
            {{ formatRatePerKg(listing.quoted_rate_per_kg) }}
          </span>
          <span v-if="listing.final_amount != null">
            {{ formatPeso(listing.final_amount) }}
          </span>
          <span v-else-if="listing.status !== 'refused'">
            Amount after weigh-in
          </span>
        </div>
        <p class="sr-only">{{ LISTING_STATUS_LABELS[listing.status] }}</p>
      </NuxtLink>

      <div
        v-if="canCancelListing(listing.status)"
        class="mt-3 border-t border-neutral-100 pt-3"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-9 w-full rounded-full border-neutral-200 text-sm"
          :disabled="submitting && targetListing?.id === listing.id"
          @click="openCancelDialog(listing, $event)"
        >
          Cancel listing
        </Button>
      </div>
    </div>

    <CancelListingDialog
      v-model:open="dialogOpen"
      :submitting="submitting"
      @confirm="confirmCancel"
    />
  </div>
</template>
