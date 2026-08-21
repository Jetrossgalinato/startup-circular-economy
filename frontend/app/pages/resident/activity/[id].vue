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
const dialogOpen = ref(false)
const submitting = ref(false)

onMounted(async () => {
  try {
    listing.value = await fetchListing(String(route.params.id))
    if (!listing.value) {
      toast.error('Listing not found', {
        description: 'It may have been cancelled or removed.',
      })
      await navigateTo('/resident/activity')
    }
  } catch (error) {
    toast.error('Could not load listing', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  } finally {
    loading.value = false
  }
})

function openCancelDialog() {
  if (!listing.value || !canCancelListing(listing.value.status) || submitting.value) {
    return
  }
  dialogOpen.value = true
}

async function confirmCancel(reason: string) {
  if (!listing.value || submitting.value) {
    return
  }

  submitting.value = true
  try {
    await cancelListing(listing.value.id, reason)
    toast.success('Listing cancelled', {
      description: 'It has been removed from your active activity.',
    })
    dialogOpen.value = false
    await navigateTo('/resident/activity')
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
      :cancelling="submitting"
      @cancel="openCancelDialog"
    />

    <CancelListingDialog
      v-model:open="dialogOpen"
      :submitting="submitting"
      @confirm="confirmCancel"
    />
  </div>
</template>
