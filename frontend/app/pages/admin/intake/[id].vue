<script setup lang="ts">
import type { Listing } from '@/types/listings'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const route = useRoute()
const listingId = computed(() => String(route.params.id))
const { fetchListing } = useAdminListings()
const listing = ref<Listing | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    listing.value = await fetchListing(listingId.value)
    if (!listing.value) {
      toast.error('Listing not found', {
        description: 'It may have been cancelled or already processed.',
      })
      await navigateTo('/admin/intake')
    }
  } catch (error) {
    toast.error('Could not load listing', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  } finally {
    loading.value = false
  }
})

async function onCompleted() {
  await navigateTo('/admin/intake')
}
</script>

<template>
  <div>
    <NuxtLink
      to="/admin/intake"
      class="text-sm text-muted-foreground underline underline-offset-2"
    >
      ← Back to intake
    </NuxtLink>

    <div v-if="loading" class="mt-8 text-sm text-muted-foreground">
      Loading…
    </div>
    <IntakeForm
      v-else-if="listing"
      class="mt-4"
      :listing="listing"
      @completed="onCompleted"
    />
  </div>
</template>
