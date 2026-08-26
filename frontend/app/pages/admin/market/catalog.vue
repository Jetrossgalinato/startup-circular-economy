<script setup lang="ts">
definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Catalog</h1>
    <p class="mt-1.5 mb-1 text-sm text-muted-foreground">
      Live listings. Open a product to hide it.
    </p>
    <DiyMarketTabs
      :items="[
        { label: 'Review', to: '/admin/market' },
        { label: 'Catalog', to: '/admin/market/catalog' },
        { label: 'Orders', to: '/admin/market/orders' },
      ]"
    />
    <DiyCatalogView
      base-path="/admin/market"
      show-status
      empty-title="No live listings"
      empty-body="Approved products will appear here."
    />
  </div>
</template>
