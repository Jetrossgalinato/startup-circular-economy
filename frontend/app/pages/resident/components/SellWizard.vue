<script setup lang="ts">
import { toast } from 'vue-sonner'
import {
  EMPTY_CONDITION,
  type HazardTier,
  type HazardTriageResult,
  type ListingCondition,
  type PayoutMethod,
  type RateCardCategory,
} from '@/types/listings'

type TriageApiResponse = HazardTriageResult & {
  source?: string
  warning?: string
}

async function requestHazardTriage(body: {
  categoryCode: string | null
  categoryName?: string
  condition: ListingCondition
  photoUrls: string[]
}, fallback = false): Promise<TriageApiResponse> {
  // Cast URL to string to avoid Nuxt typed-routes $fetch recursion on /api/*
  const url = fallback
    ? '/api/hazard-triage?fallback=rules'
    : '/api/hazard-triage'

  return $fetch<TriageApiResponse>(url as string, {
    method: 'POST',
    body,
  })
}

const steps = [
  'photos',
  'condition',
  'category',
  'triage',
  'rate',
  'pickup',
] as const

type Step = (typeof steps)[number]

const { createListing, updateListing, fetchListing } = useListings()
const { uploadPhotos, getSignedUrls } = useListingUpload()
const { fetchCategories, peekCategories } = useRateCard()
const { profile } = useAuth()

const stepIndex = ref(0)
const loading = ref(false)
const triaging = ref(false)
const listingId = ref<string | null>(null)
const photosUploaded = ref(false)

const files = ref<File[]>([])
const previews = ref<string[]>([])
const condition = ref<ListingCondition>({ ...EMPTY_CONDITION })
const categories = ref<RateCardCategory[]>(peekCategories() ?? [])
const categoryCode = ref<string | null>(null)
const hazardTier = ref<HazardTier | null>(null)
const triageReasons = ref<string[]>([])
const payoutMethod = ref<PayoutMethod | null>(
  profile.value?.default_payout_method ?? null,
)
const gcashNumber = ref(profile.value?.default_gcash_number ?? '')
const pickupAddress = ref(profile.value?.address ?? '')
const pickupWindow = ref('')
const pickupNotes = ref('')

const step = computed(() => steps[stepIndex.value])
const selectedCategory = computed(
  () => categories.value.find((c) => c.code === categoryCode.value) ?? null,
)

onMounted(async () => {
  try {
    categories.value = await fetchCategories()
  } catch (error) {
    toast.error('Could not load rate card', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  }
})

onBeforeUnmount(() => {
  previews.value.forEach((url) => URL.revokeObjectURL(url))
})

function addFiles(next: File[]) {
  const incoming = next.slice(0, Math.max(0, 6 - files.value.length))
  files.value = [...files.value, ...incoming]
  previews.value = [
    ...previews.value,
    ...incoming.map((file) => URL.createObjectURL(file)),
  ]
}

function removeFile(index: number) {
  const preview = previews.value.at(index)
  if (typeof preview === 'string') {
    URL.revokeObjectURL(preview)
  }
  files.value = files.value.filter((_, i) => i !== index)
  previews.value = previews.value.filter((_, i) => i !== index)
}

function canContinue(): boolean {
  switch (step.value) {
    case 'photos':
      return files.value.length > 0
    case 'condition':
      return true
    case 'category':
      return Boolean(categoryCode.value)
    case 'triage':
      return hazardTier.value != null && hazardTier.value !== 4 && !triaging.value
    case 'rate':
      if (!payoutMethod.value) return false
      if (payoutMethod.value === 'gcash') {
        return gcashNumber.value.trim().length >= 10
      }
      return true
    case 'pickup':
      return pickupAddress.value.trim().length > 5 && Boolean(pickupWindow.value)
    default:
      return false
  }
}

async function ensureListing() {
  if (listingId.value) {
    return listingId.value
  }
  const listing = await createListing({
    category_code: categoryCode.value,
    condition: condition.value,
  })
  listingId.value = listing.id
  return listing.id
}

async function runTriage() {
  triaging.value = true
  hazardTier.value = null
  triageReasons.value = []

  try {
    const id = await ensureListing()
    await updateListing(id, {
      status: 'triaging',
      category_code: categoryCode.value,
      condition: condition.value,
    })

    if (!photosUploaded.value) {
      await uploadPhotos(id, files.value)
      photosUploaded.value = true
    }

    const listing = await fetchListing(id)
    const photos = await getSignedUrls(listing?.listing_photos ?? [])
    const photoUrls = photos
      .map((p) => p.signed_url)
      .filter((url): url is string => Boolean(url))

    let result: HazardTriageResult

    const triageBody = {
      categoryCode: categoryCode.value,
      categoryName: selectedCategory.value?.name,
      condition: condition.value,
      photoUrls,
    }

    try {
      result = await requestHazardTriage(triageBody)
    } catch {
      result = await requestHazardTriage(triageBody, true)
    }

    hazardTier.value = result.tier
    triageReasons.value = result.reasons

    const nextStatus = result.tier === 4 ? 'refused' : 'awaiting_acceptance'
    const rate = selectedCategory.value?.rate_per_kg ?? null

    await updateListing(id, {
      hazard_tier: result.tier,
      triage_reasons: result.reasons,
      triage_flags: result.flags,
      status: nextStatus,
      quoted_rate_per_kg: rate,
    })
  } catch (error) {
    toast.error('Triage failed', {
      description: error instanceof Error ? error.message : 'Please try again.',
    })
    stepIndex.value = steps.indexOf('category')
  } finally {
    triaging.value = false
  }
}

async function goNext() {
  if (!canContinue() && step.value !== 'triage') {
    toast.error('Incomplete step', {
      description: 'Complete this step to continue.',
    })
    return
  }

  if (step.value === 'category') {
    stepIndex.value += 1
    await runTriage()
    return
  }

  if (step.value === 'triage' && hazardTier.value === 4) {
    toast.error('Intake refused', {
      description: 'This item cannot be picked up safely. See DENR-EMB guidance.',
    })
    return
  }

  if (step.value === 'pickup') {
    await submitPickup()
    return
  }

  stepIndex.value += 1
}

function goBack() {
  if (stepIndex.value === 0 || triaging.value) return
  if (step.value === 'triage') {
    stepIndex.value = steps.indexOf('category')
    return
  }
  stepIndex.value -= 1
}

async function submitPickup() {
  if (!listingId.value || !selectedCategory.value) return

  loading.value = true
  try {
    await updateListing(listingId.value, {
      payout_method: payoutMethod.value,
      gcash_number: payoutMethod.value === 'gcash' ? gcashNumber.value.trim() : null,
      pickup_address: pickupAddress.value.trim(),
      preferred_pickup_window: pickupWindow.value,
      pickup_notes: pickupNotes.value.trim() || null,
      quoted_rate_per_kg: selectedCategory.value.rate_per_kg,
      status: 'pickup_scheduled',
    })

    toast.success('Pickup scheduled', {
      description: 'Track progress anytime from Activity.',
    })
    await navigateTo(`/resident/activity/${listingId.value}`)
  } catch (error) {
    toast.error('Could not schedule pickup', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between gap-3">
      <p class="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Step {{ stepIndex + 1 }} / {{ steps.length }}
      </p>
      <div class="flex gap-1">
        <span
          v-for="(s, i) in steps"
          :key="s"
          class="h-1 w-5 rounded-full sm:w-6"
          :class="i <= stepIndex ? 'bg-foreground' : 'bg-neutral-200'"
        />
      </div>
    </div>

    <SellPhotoStep
      v-if="step === 'photos'"
      :files="files"
      :previews="previews"
      @add="addFiles"
      @remove="removeFile"
    />
    <SellConditionStep
      v-else-if="step === 'condition'"
      v-model="condition"
    />
    <SellCategoryStep
      v-else-if="step === 'category'"
      v-model="categoryCode"
      :categories="categories"
    />
    <SellTriageResult
      v-else-if="step === 'triage'"
      :tier="hazardTier ?? 1"
      :reasons="triageReasons"
      :loading="triaging || hazardTier == null"
    />
    <SellRateAccept
      v-else-if="step === 'rate' && selectedCategory && hazardTier"
      v-model:payout-method="payoutMethod"
      v-model:gcash-number="gcashNumber"
      :category-name="selectedCategory.name"
      :rate-per-kg="selectedCategory.rate_per_kg"
      :tier="hazardTier"
    />
    <SellPickupStep
      v-else-if="step === 'pickup'"
      v-model:address="pickupAddress"
      v-model:window-pref="pickupWindow"
      v-model:notes="pickupNotes"
    />

    <div class="mt-8 flex gap-2">
      <Button
        v-if="stepIndex > 0 && step !== 'triage'"
        type="button"
        variant="outline"
        class="h-11 flex-1 rounded-full border-neutral-200"
        :disabled="loading || triaging"
        @click="goBack"
      >
        Back
      </Button>
      <Button
        type="button"
        class="h-11 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
        :disabled="loading || triaging || (step === 'triage' && (hazardTier == null || hazardTier === 4)) || (step !== 'triage' && !canContinue())"
        @click="goNext"
      >
        <template v-if="loading">
          Saving…
        </template>
        <template v-else-if="step === 'pickup'">
          Confirm pickup
        </template>
        <template v-else-if="step === 'triage' && hazardTier === 4">
          Intake refused
        </template>
        <template v-else-if="step === 'rate'">
          Accept rate
        </template>
        <template v-else>
          Continue
        </template>
      </Button>
    </div>

    <p
      v-if="step === 'triage' && hazardTier === 4"
      class="mt-4 text-center text-sm text-muted-foreground"
    >
      DENR-EMB hotline / nearest accredited TSD — we cannot schedule this pickup.
    </p>
  </div>
</template>
