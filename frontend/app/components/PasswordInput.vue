<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'

defineProps<{
  id: string
  inputClass?: HTMLAttributes['class']
}>()

const showPassword = ref(false)
</script>

<template>
  <div class="relative">
    <Input
      :id="id"
      :type="showPassword ? 'text' : 'password'"
      :class="[inputClass, 'pr-10']"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      @click="showPassword = !showPassword"
    >
      <EyeOff v-if="showPassword" class="size-4" />
      <Eye v-else class="size-4" />
    </button>
  </div>
</template>
