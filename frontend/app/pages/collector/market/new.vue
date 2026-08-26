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
      List a <span class="font-serif font-medium italic">piece</span>
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Only products made from e-waste. Admin reviews before it appears in the market.
    </p>
    <DiyProductWizard @submitted="navigateTo('/collector/market/listings')" />
  </div>
</template>
