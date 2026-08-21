<script setup lang="ts">
definePageMeta({
  layout: 'resident',
  middleware: ['authenticated', 'role'],
  role: 'resident',
})
</script>

<template>
  <ProfileForm />
</template>
