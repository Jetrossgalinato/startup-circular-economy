<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})
</script>

<template>
  <div>
    <div class="mb-1 flex items-start justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          DIY <span class="font-serif font-medium italic">market</span>
        </h1>
        <p class="mt-1.5 text-sm text-muted-foreground">
          Upcycled pieces made from e-waste. Buy now or save to cart — checkout is one product at a time.
        </p>
      </div>
    </div>
    <DiyMarketTabs
      :items="[
        { label: 'Shop', to: '/resident/market' },
        { label: 'Cart', to: '/resident/market/cart' },
        { label: 'My orders', to: '/resident/market/orders' },
      ]"
    />
    <DiyCatalogView base-path="/resident/market" />
  </div>
</template>
