<script setup lang="ts">
import type { AdminOpsSummary } from '@/composables/useAdminListings'
import type { RateCardCategory } from '@/types/listings'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { profile } = useAuth()
const { fetchOpsSummary } = useAdminListings()
const { fetchCategories, peekCategories } = useRateCard()

const summary = ref<AdminOpsSummary>({ scheduled: 0, weighed: 0, paidToday: 0 })
const categories = ref<RateCardCategory[]>(peekCategories() ?? [])
const loading = ref(true)

onMounted(async () => {
  try {
    const [nextSummary, nextCategories] = await Promise.all([
      fetchOpsSummary(),
      fetchCategories(),
    ])
    summary.value = nextSummary
    categories.value = nextCategories
  } catch {
    // Keep zeros / peeked rate card
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Cross-dock
        <span class="font-serif font-medium italic">home</span>
      </h1>
      <p class="mt-2 text-sm text-muted-foreground sm:text-base">
        Hello{{ profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : '' }}.
        Weigh scheduled pickups, pay residents, and publish company stock for collectors.
      </p>
    </div>

    <HomeOpsSummary :summary="summary" :loading="loading" />

    <Button
      as-child
      size="lg"
      class="h-12 w-full rounded-full bg-foreground text-base text-white hover:bg-foreground/90"
    >
      <NuxtLink to="/admin/intake">
        Open intake queue
      </NuxtLink>
    </Button>

    <div class="grid grid-cols-2 gap-3">
      <NuxtLink
        to="/admin/activity"
        class="rounded-[1.5rem] bg-[#dce8ee] p-4 transition hover:opacity-90"
      >
        <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
          ACTIVITY
        </p>
        <p class="mt-1 text-lg font-bold tracking-tight">
          All listings
        </p>
      </NuxtLink>
      <NuxtLink
        to="/admin/rates"
        class="rounded-[1.5rem] bg-[#ead9c4] p-4 transition hover:opacity-90"
      >
        <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
          RATES
        </p>
        <p class="mt-1 text-lg font-bold tracking-tight">
          Edit ₱/kg
        </p>
      </NuxtLink>
    </div>

    <RateCardTeaser v-if="categories.length" :categories="categories" />
  </div>
</template>
