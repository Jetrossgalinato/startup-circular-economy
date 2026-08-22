<script setup lang="ts">
import type { AdminOpsSummary } from '@/composables/useAdminListings'
import type { RateCardCategory } from '@/types/listings'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})

const { profile } = useAuth()
const { fetchOpsSummary, peekOpsSummary } = useAdminListings()
const { fetchUnreadCount, peekUnreadCount } = useAdminClaims()
const { fetchCategories, peekCategories } = useRateCard()
const { listingsTick, rateCardTick } = useRealtimeTicks()

const summary = ref<AdminOpsSummary>(
  peekOpsSummary() ?? { scheduled: 0, weighed: 0, paidToday: 0 },
)
const categories = ref<RateCardCategory[]>(peekCategories() ?? [])
const unreadClaims = ref(peekUnreadCount() ?? 0)
const loading = ref(peekOpsSummary() === null)

async function loadHome(force = false) {
  const hadCache = peekOpsSummary() !== null
  if (!hadCache) {
    loading.value = true
  }

  try {
    const [nextSummary, nextCategories, nextUnread] = await Promise.all([
      fetchOpsSummary({ force }),
      fetchCategories({ force }),
      fetchUnreadCount({ force }),
    ])
    summary.value = nextSummary
    categories.value = nextCategories
    unreadClaims.value = nextUnread
  } catch {
    // Keep zeros / peeked rate card
  } finally {
    loading.value = false
  }
}

onMounted(() => loadHome())

watch(listingsTick, () => {
  void fetchOpsSummary({ force: true }).then((next) => {
    summary.value = next
  }).catch(() => {})
  void fetchUnreadCount({ force: true }).then((next) => {
    unreadClaims.value = next
  }).catch(() => {})
})

watch(rateCardTick, () => {
  void fetchCategories({ force: true }).then((next) => {
    categories.value = next
  }).catch(() => {})
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

    <NuxtLink
      to="/admin/claims"
      class="block rounded-[1.5rem] bg-[#ead9c4] p-4 transition hover:opacity-90"
    >
      <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
        CLAIMS
      </p>
      <p class="mt-1 text-3xl font-bold tracking-tight">
        {{ unreadClaims }}
      </p>
      <p class="mt-0.5 text-sm text-foreground/70">
        Unseen collector claims
      </p>
    </NuxtLink>

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
