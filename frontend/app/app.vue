<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster position="top-right" rich-colors close-button />
  </div>
</template>
