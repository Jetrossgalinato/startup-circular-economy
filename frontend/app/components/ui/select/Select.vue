<script setup lang="ts">
import type { AcceptableValue } from "reka-ui"
import { SelectRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps()
const emits = defineEmits<{
  "update:modelValue": [value: AcceptableValue]
  "update:open": [value: boolean]
}>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectRoot v-bind="forwarded">
    <slot />
  </SelectRoot>
</template>
