<script setup lang="ts">
definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'collector',
})
</script>

<template>
  <CollectorProfileForm />
</template>
