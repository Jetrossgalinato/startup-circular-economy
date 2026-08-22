<script setup lang="ts">
definePageMeta({
  layout: 'inside',
  middleware: ['authenticated', 'role'],
  role: 'admin',
})
</script>

<template>
  <AdminProfileForm />
</template>
