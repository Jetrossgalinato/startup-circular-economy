<script setup lang="ts">
import type { Listing } from '@/types/listings'

definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})

const { profile } = useAuth()
const { fetchCatalog, peekCatalog, fetchOrders, peekOrders } = useCollectorStock()
const { listingsTick } = useRealtimeTicks()

const catalog = ref<Listing[]>(peekCatalog() ?? [])
const orders = ref<Listing[]>(peekOrders() ?? [])
const loading = ref(peekCatalog() === null)

async function loadHome(force = false) {
  const hadCache = peekCatalog() !== null
  if (!hadCache) {
    loading.value = true
  }

  try {
    const [nextCatalog, nextOrders] = await Promise.all([
      fetchCatalog({ force }),
      fetchOrders({ force }),
    ])
    catalog.value = nextCatalog
    orders.value = nextOrders
  } catch {
    if (!hadCache) {
      catalog.value = []
      orders.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => loadHome())

watch(listingsTick, () => {
  void loadHome(true)
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Company
        <span class="font-serif font-medium italic">stock</span>
      </h1>
      <p class="mt-2 text-sm text-muted-foreground sm:text-base">
        Hello{{ profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : '' }}.
        Claim cleared e-waste from the cross-dock — never from residents.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-[1.5rem] bg-[#dce8ee] p-4">
        <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
          AVAILABLE
        </p>
        <p class="mt-1 text-3xl font-bold tracking-tight">
          {{ loading && catalog.length === 0 ? '—' : catalog.length }}
        </p>
        <p class="mt-0.5 text-xs text-foreground/70">
          Ready to claim
        </p>
      </div>
      <div class="rounded-[1.5rem] bg-[#ead9c4] p-4">
        <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
          CLAIMED
        </p>
        <p class="mt-1 text-3xl font-bold tracking-tight">
          {{ orders.length }}
        </p>
        <p class="mt-0.5 text-xs text-foreground/70">
          Your orders
        </p>
      </div>
    </div>

    <Button
      as-child
      size="lg"
      class="h-12 w-full rounded-full bg-foreground text-base text-white hover:bg-foreground/90"
    >
      <NuxtLink to="/collector/browse">
        Browse stock
      </NuxtLink>
    </Button>

    <DiyTeaserCard
      to="/collector/market"
      kicker="DIY MARKET"
      title="Sell upcycled pieces"
      body="List products made from e-waste. Admin reviews before they go live."
    />

    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold">Available now</h2>
        <NuxtLink to="/collector/browse" class="text-sm text-muted-foreground underline underline-offset-2">
          See all
        </NuxtLink>
      </div>
      <p v-if="loading && catalog.length === 0" class="text-sm text-muted-foreground">
        Loading stock…
      </p>
      <p
        v-else-if="catalog.length === 0"
        class="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-muted-foreground"
      >
        No lots yet. New stock appears after admin payout.
      </p>
      <div v-else class="space-y-2">
        <NuxtLink
          v-for="listing in catalog.slice(0, 3)"
          :key="listing.id"
          :to="`/collector/browse/${listing.id}`"
        >
          <CollectorStockCard :listing="listing" />
        </NuxtLink>
      </div>
    </div>

    <div v-if="orders.length">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold">Recent claims</h2>
        <NuxtLink to="/collector/orders" class="text-sm text-muted-foreground underline underline-offset-2">
          See all
        </NuxtLink>
      </div>
      <div class="space-y-2">
        <NuxtLink
          v-for="listing in orders.slice(0, 3)"
          :key="listing.id"
          :to="`/collector/orders`"
        >
          <CollectorStockCard :listing="listing" />
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-[1.5rem] border border-neutral-200 p-4">
        <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
          PICKUP
        </p>
        <p class="mt-1 text-sm font-medium leading-5">
          Collect at the Butuan cross-dock
        </p>
      </div>
      <div class="rounded-[1.5rem] border border-neutral-200 p-4">
        <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
          DELIVERY
        </p>
        <p class="mt-1 text-sm font-medium leading-5">
          Send to the address on your profile
        </p>
      </div>
    </div>
  </div>
</template>
