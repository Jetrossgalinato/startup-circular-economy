<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  id: string
  modelValue?: string
  inputClass?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
})

const showPassword = ref(false)
</script>

<template>
  <div class="relative">
    <Input
      :id="id"
      v-model="modelValue"
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
