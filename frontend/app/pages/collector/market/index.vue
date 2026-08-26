<script setup lang="ts">
definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      DIY <span class="font-serif font-medium italic">market</span>
    </h1>
    <p class="mt-1.5 mb-1 text-sm text-muted-foreground">
      Browse live listings. Sell your own upcycled e-waste through Listings.
    </p>
    <DiyMarketTabs
      :items="[
        { label: 'Shop', to: '/collector/market' },
        { label: 'Sell', to: '/collector/market/new' },
        { label: 'My listings', to: '/collector/market/listings' },
        { label: 'Orders', to: '/collector/market/orders' },
      ]"
    />
    <DiyCatalogView base-path="/collector/market" />
  </div>
</template>
