<script setup lang="ts">
type Tab = { label: string, to: string }

defineProps<{
  items: Tab[]
}>()

const route = useRoute()

function isActive(to: string) {
  const path = route.path.replace(/\/$/, '')
  const target = to.replace(/\/$/, '')
  if (path === target) {
    return true
  }
  if (target.endsWith('/market')) {
    return false
  }
  return path.startsWith(`${target}/`)
}
</script>

<template>
  <div class="mb-5 flex gap-2 overflow-x-auto pb-1">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
      :class="isActive(item.to)
        ? 'border-foreground bg-foreground text-white'
        : 'border-neutral-200 bg-white text-foreground/80'"
    >
      {{ item.label }}
    </NuxtLink>
  </div>
</template>
