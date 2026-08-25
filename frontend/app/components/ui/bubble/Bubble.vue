<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import type { BubbleVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { bubbleVariants } from "."

const props = withDefaults(defineProps<{
  variant?: BubbleVariants["variant"]
  align?: "start" | "end"
  class?: HTMLAttributes["class"]
  as?: string
  asChild?: boolean
}>(), {
  variant: "default",
  align: "start",
  as: "div",
})
</script>

<template>
  <Primitive
    data-slot="bubble"
    :data-variant="variant"
    :data-align="align"
    :as="as"
    :as-child="asChild"
    :class="cn(bubbleVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
