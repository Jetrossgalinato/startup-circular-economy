<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated', 'role'],
  role: 'admin',
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
    <h1 class="text-3xl font-bold tracking-tight text-foreground">
      Admin dashboard
    </h1>
    <LogoutButton />
  </div>
</template>
