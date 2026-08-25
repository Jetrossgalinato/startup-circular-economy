<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  align?: "start" | "end"
  as?: string
  asChild?: boolean
}>(), {
  align: "start",
  as: "div",
})
</script>

<template>
  <Primitive
    data-slot="message"
    :data-align="align"
    :as="as"
    :as-child="asChild"
    :class="cn(
      'text-sm gap-2 group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse',
      props.class,
    )"
  >
    <slot />
  </Primitive>
</template>
