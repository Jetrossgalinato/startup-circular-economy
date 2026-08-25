<script setup lang="ts">
import { AvatarImage } from "reka-ui"

defineProps<{
  src: string
}>()
</script>

<template>
  <AvatarImage
    data-slot="avatar-image"
    :src="src"
    class="aspect-square size-full"
  >
    <slot />
  </AvatarImage>
</template>
