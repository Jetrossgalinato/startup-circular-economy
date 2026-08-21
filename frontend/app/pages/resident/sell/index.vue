<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})
</script>

<template>
  <div>
    <p class="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
      B2C SELL
    </p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight">
      Sell your
      <span class="font-serif font-medium italic">e-waste</span>
    </h1>
    <p class="mt-2 mb-6 text-sm text-muted-foreground">
      Photos and condition first. We triage for safety, then show the published per-kilo rate.
    </p>
    <SellWizard />
  </div>
</template>
