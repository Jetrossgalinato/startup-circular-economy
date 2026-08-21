<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { canCancelListing } from '@/types/listings'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})

const route = useRoute()
const { fetchListing, cancelListing } = useListings()
const listing = ref<Listing | null>(null)
const loading = ref(true)
const cancelling = ref(false)

onMounted(async () => {
  try {
    listing.value = await fetchListing(String(route.params.id))
    if (!listing.value) {
      toast.error('Listing not found')
      await navigateTo('/resident/activity')
    }
  } catch (error) {
    toast.error('Could not load listing', {
      description: error instanceof Error ? error.message : undefined,
    })
  } finally {
    loading.value = false
  }
})

async function handleCancel() {
  if (!listing.value || !canCancelListing(listing.value.status) || cancelling.value) {
    return
  }

  const confirmed = window.confirm(
    'Cancel this listing? Logistics will not pick it up.',
  )
  if (!confirmed) {
    return
  }

  cancelling.value = true
  try {
    await cancelListing(listing.value.id)
    toast.success('Listing cancelled', {
      description: 'It has been removed from your active activity.',
    })
    await navigateTo('/resident/activity')
  } catch (error) {
    toast.error('Could not cancel listing', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink
      to="/resident/activity"
      class="text-sm text-muted-foreground underline underline-offset-2"
    >
      ← Back to activity
    </NuxtLink>

    <div v-if="loading" class="mt-8 text-sm text-muted-foreground">
      Loading…
    </div>
    <ListingDetailCard
      v-else-if="listing"
      class="mt-4"
      :listing="listing"
      :cancelling="cancelling"
      @cancel="handleCancel"
    />
  </div>
</template>
