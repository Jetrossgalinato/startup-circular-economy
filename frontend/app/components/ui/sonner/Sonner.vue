<script lang="ts" setup>
import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
  X,
} from '@lucide/vue'
import { Toaster as Sonner } from 'vue-sonner'
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <Sonner
    :class="cn('toaster group', $attrs.class as string)"
    :style="{
      '--normal-bg': '#ffffff',
      '--normal-text': 'var(--foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    :toast-options="{
      classes: {
        toast: 'group toast !bg-white !text-foreground !border-border shadow-lg',
        title: 'text-sm font-semibold text-foreground',
        description: 'text-sm text-muted-foreground',
        closeButton: '!bg-white !border-border !text-foreground',
      },
    }"
    v-bind="$attrs"
  >
    <template #success-icon>
      <CircleCheck class="size-4 text-emerald-600" />
    </template>
    <template #info-icon>
      <Info class="size-4 text-sky-600" />
    </template>
    <template #warning-icon>
      <TriangleAlert class="size-4 text-amber-600" />
    </template>
    <template #error-icon>
      <OctagonX class="size-4 text-red-600" />
    </template>
    <template #loading-icon>
      <div>
        <LoaderCircle class="size-4 animate-spin text-muted-foreground" />
      </div>
    </template>
    <template #close-icon>
      <X class="size-4" />
    </template>
  </Sonner>
</template>
