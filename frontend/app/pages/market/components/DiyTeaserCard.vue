<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'

defineProps<{
  to: string
  kicker: string
  title: string
  body: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex items-start justify-between gap-3 rounded-[1.5rem] bg-[#ead9c4] p-4 transition hover:opacity-90 active:opacity-80"
  >
    <div>
      <p class="text-[10px] font-semibold tracking-[0.16em] text-foreground/50">
        {{ kicker }}
      </p>
      <p class="mt-1 text-lg font-bold tracking-tight">
        {{ title }}
      </p>
      <p class="mt-0.5 text-sm text-foreground/70">
        {{ body }}
      </p>
    </div>
    <ChevronRight class="mt-0.5 size-5 shrink-0 text-foreground/40" />
  </NuxtLink>
</template>
