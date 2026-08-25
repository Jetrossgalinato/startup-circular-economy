<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  as?: string
  asChild?: boolean
}>(), {
  as: "div",
})
</script>

<template>
  <Primitive
    data-slot="message-group"
    :as="as"
    :as-child="asChild"
    :class="cn(
      'gap-2 flex min-w-0 flex-col',
      props.class,
    )"
  >
    <slot />
  </Primitive>
</template>
