<script setup lang="ts">
definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      Rate
      <span class="font-serif font-medium italic">card</span>
    </h1>
    <p class="mt-1.5 mb-6 text-sm text-muted-foreground">
      Published ₱/kg residents see at sell. Changes apply to new listings immediately.
    </p>
    <RateCardEditor />
  </div>
</template>
