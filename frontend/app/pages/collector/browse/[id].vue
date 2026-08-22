<script setup lang="ts">
import type { FulfillmentMethod, Listing } from '@/types/listings'
import { toast } from 'vue-sonner'
import { formatPeso, formatRatePerKg } from '@/utils/listings/format'
import { claimBadgeLabel, collectorClaimMessage } from '@/utils/listings/claims'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const route = useRoute()
const listingId = computed(() => String(route.params.id))
const { profile, user } = useAuth()
const { fetchListing, peekListing, claimListing } = useCollectorStock()
const { getSignedUrls } = useListingUpload()
const { listingsTick } = useRealtimeTicks()

const listing = ref<Listing | null>(peekListing(listingId.value))
const loading = ref(listing.value == null)
const claiming = ref(false)
const fulfillment = ref<FulfillmentMethod>('pickup')
const photos = ref(listing.value?.listing_photos ?? [])

const canDeliver = computed(() =>
  Boolean(profile.value?.address?.trim() && profile.value?.phone?.trim()),
)

const isOwnClaim = computed(() =>
  listing.value?.status === 'claimed' && listing.value.claimed_by === user.value?.id,
)

async function loadListing(showError = true, force = false) {
  try {
    listing.value = await fetchListing(listingId.value, { force })
    if (!listing.value && showError) {
      toast.error('Item not found', {
        description: 'It may already be claimed.',
      })
      await navigateTo('/collector/browse')
      return
    }
    if (listing.value?.listing_photos?.length) {
      photos.value = await getSignedUrls(listing.value.listing_photos)
    }
  } catch (error) {
    if (showError) {
      toast.error('Could not load item', {
        description: error instanceof Error ? error.message : 'Try again later.',
      })
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadListing())

watch(listingsTick, () => {
  void loadListing(false, true)
})

async function claim() {
  if (!listing.value || claiming.value) {
    return
  }
  if (listing.value.status === 'claimed') {
    return
  }
  if (fulfillment.value === 'delivery' && !canDeliver.value) {
    toast.error('Address required', {
      description: 'Add a phone and address on your profile to request delivery.',
    })
    return
  }

  claiming.value = true
  try {
    listing.value = await claimListing(listing.value.id, {
      fulfillment: fulfillment.value,
      deliveryAddress: profile.value?.address ?? undefined,
    })
    toast.success('Item claimed', {
      description: fulfillment.value === 'pickup'
        ? 'Collect it at the Butuan cross-dock. See Orders for details.'
        : 'We will deliver to the address on your profile.',
    })
    await navigateTo('/collector/orders')
  } catch (error) {
    toast.error('Could not claim item', {
      description: error instanceof Error ? error.message : 'It may already be claimed.',
    })
  } finally {
    claiming.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink
      to="/collector/browse"
      class="text-sm text-muted-foreground underline underline-offset-2"
    >
      ← Back to browse
    </NuxtLink>

    <div v-if="loading" class="mt-8 text-sm text-muted-foreground">
      Loading…
    </div>

    <div v-else-if="listing" class="mt-4 space-y-4">
      <div
        v-if="photos.some((photo) => photo.signed_url)"
        class="flex gap-2 overflow-x-auto"
      >
        <img
          v-for="photo in photos"
          :key="photo.id"
          :src="photo.signed_url"
          alt="Stock photo"
          class="h-28 w-28 shrink-0 rounded-2xl object-cover"
        >
      </div>

      <div class="rounded-[1.5rem] border border-neutral-200 p-5">
        <p class="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Company stock
        </p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight">
          {{ listing.rate_card_categories?.name || listing.category_code || 'Item' }}
        </h1>
        <ActivityStatusBadge
          :status="listing.status"
          :label="claimBadgeLabel(listing)"
          class="mt-2"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-neutral-50 p-4">
          <p class="text-xs text-muted-foreground">Weight</p>
          <p class="mt-1 text-lg font-semibold">
            {{ listing.weight_kg != null ? `${listing.weight_kg} kg` : '—' }}
          </p>
        </div>
        <div class="rounded-2xl bg-neutral-50 p-4">
          <p class="text-xs text-muted-foreground">Amount</p>
          <p class="mt-1 text-lg font-semibold">
            {{ listing.final_amount != null ? formatPeso(listing.final_amount) : formatRatePerKg(listing.quoted_rate_per_kg) }}
          </p>
        </div>
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
      </div>

      <template v-if="listing.status !== 'claimed'">
        <CollectorClaimSheet
          v-model:fulfillment="fulfillment"
          :profile-address="profile?.address ?? ''"
        />
        <Button
          type="button"
          size="lg"
          class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50"
          :disabled="claiming || (fulfillment === 'delivery' && !canDeliver)"
          @click="claim"
        >
          {{ claiming ? 'Claiming…' : 'Claim item' }}
        </Button>
      </template>
      <p v-else-if="isOwnClaim" class="text-sm text-foreground">
        {{ collectorClaimMessage(listing) }}
      </p>
      <p v-else class="text-sm text-muted-foreground">
        This lot is already claimed. See Orders.
      </p>
    </div>
  </div>
</template>
