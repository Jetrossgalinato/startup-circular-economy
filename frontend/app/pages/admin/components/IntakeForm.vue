<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { HazardTier, Listing } from '@/types/listings'
import { AUTH_INPUT_CLASS } from '@/constants/auth'
import { formatPeso, formatRatePerKg } from '@/utils/listings/format'

const props = defineProps<{
  listing: Listing
}>()

const emit = defineEmits<{
  completed: [listing: Listing]
}>()

const { completeIntake } = useAdminListings()
const { getSignedUrls } = useListingUpload()

const photos = ref(props.listing.listing_photos ?? [])
const weightKg = ref(props.listing.weight_kg != null ? String(props.listing.weight_kg) : '')
const hazardTier = ref<HazardTier>(props.listing.hazard_tier ?? 1)
const submitting = ref(false)

const quotedRate = computed(() =>
  props.listing.quoted_rate_per_kg
  ?? props.listing.rate_card_categories?.rate_per_kg
  ?? 0,
)

const parsedWeight = computed(() => {
  const value = Number(weightKg.value)
  return Number.isFinite(value) ? value : 0
})

const previewAmount = computed(() =>
  Number((parsedWeight.value * quotedRate.value).toFixed(2)),
)

const isRefusedPath = computed(() => hazardTier.value === 4)

onMounted(async () => {
  try {
    photos.value = await getSignedUrls(props.listing.listing_photos ?? [])
  } catch {
    photos.value = props.listing.listing_photos ?? []
  }
})

async function submit() {
  if (submitting.value) {
    return
  }

  if (!isRefusedPath.value && !(parsedWeight.value > 0)) {
    toast.error('Weight required', {
      description: 'Enter the scale weight in kilograms before marking paid.',
    })
    return
  }

  submitting.value = true
  try {
    const next = await completeIntake(props.listing.id, {
      weightKg: parsedWeight.value,
      hazardTier: hazardTier.value,
      quotedRatePerKg: quotedRate.value,
    })
    toast.success(
      isRefusedPath.value ? 'Intake closed' : 'Resident marked paid',
      {
        description: isRefusedPath.value
          ? 'Tier 4 items are not paid and do not enter collector stock.'
          : `${formatPeso(next.final_amount)} recorded. Item is now company stock${next.resale_eligible ? '.' : ' (not listed for general resale).'}`,
      },
    )
    emit('completed', next)
  } catch (error) {
    toast.error('Could not complete intake', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
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

    <div class="rounded-[1.5rem] border border-neutral-200 p-5">
      <p class="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Intake
      </p>
      <h2 class="mt-1 text-xl font-bold tracking-tight">
        {{ listing.rate_card_categories?.name || listing.category_code || 'Item' }}
      </h2>
      <ActivityStatusBadge :status="listing.status" class="mt-2" />
      <p class="mt-3 text-sm text-muted-foreground">
        Rate {{ formatRatePerKg(quotedRate) }} · AI/rules flagged
        {{ listing.hazard_tier ? `tier ${listing.hazard_tier}` : 'no tier yet' }}.
      </p>
    </div>

    <div class="rounded-2xl border border-neutral-200 p-4">
      <p class="text-sm font-semibold">Resident / pickup</p>
      <p class="mt-1 text-sm text-foreground">
        {{ listing.resident?.full_name || 'Resident' }}
      </p>
      <p v-if="listing.resident?.phone" class="text-sm text-muted-foreground">
        {{ listing.resident.phone }}
      </p>
      <p class="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">
        {{ listing.pickup_address || listing.resident?.address || 'No address' }}
      </p>
      <p v-if="listing.preferred_pickup_window" class="mt-1 text-sm text-muted-foreground">
        Window: {{ listing.preferred_pickup_window }}
      </p>
      <p class="mt-2 text-sm text-muted-foreground capitalize">
        Payout: {{ listing.payout_method || '—' }}
        <template v-if="listing.payout_method === 'gcash' && listing.gcash_number">
          · {{ listing.gcash_number }}
        </template>
      </p>
    </div>

    <div v-if="listing.triage_reasons?.length" class="rounded-2xl border border-neutral-200 p-4">
      <p class="text-sm font-semibold">Triage reasons</p>
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

    <div class="flex flex-col gap-1.5">
      <Label for="weight">Weight (kg)</Label>
      <Input
        id="weight"
        v-model="weightKg"
        type="number"
        min="0"
        step="0.001"
        inputmode="decimal"
        placeholder="0.000"
        :disabled="isRefusedPath"
        :class="AUTH_INPUT_CLASS"
      />
    </div>

    <div>
      <p class="text-sm font-medium">Confirmed hazard tier</p>
      <div class="mt-2 grid grid-cols-4 gap-2">
        <button
          v-for="tier in ([1, 2, 3, 4] as HazardTier[])"
          :key="tier"
          type="button"
          class="rounded-full border px-2 py-2 text-sm font-medium"
          :class="hazardTier === tier
            ? 'border-foreground bg-foreground text-white'
            : 'border-neutral-200 bg-white'"
          @click="hazardTier = tier"
        >
          {{ tier }}
        </button>
      </div>
      <p class="mt-2 text-xs text-muted-foreground">
        Tier 3 is paid but not listed for general collector resale. Tier 4 is refused — no payout.
      </p>
    </div>

    <div class="rounded-2xl bg-neutral-50 p-4">
      <p class="text-xs text-muted-foreground">Payout preview</p>
      <p class="mt-1 text-2xl font-bold tracking-tight">
        {{ isRefusedPath ? '—' : formatPeso(previewAmount) }}
      </p>
    </div>

    <Button
      type="submit"
      size="lg"
      :disabled="submitting || listing.status === 'paid'"
      class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50"
    >
      {{ submitting
        ? 'Saving…'
        : isRefusedPath
          ? 'Close as refused'
          : 'Mark resident paid' }}
    </Button>
  </form>
</template>
