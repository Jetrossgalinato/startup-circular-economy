<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import type { BubbleReactionsVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { bubbleReactionsVariants } from "."

const props = withDefaults(defineProps<{
  side?: BubbleReactionsVariants["side"]
  align?: BubbleReactionsVariants["align"]
  class?: HTMLAttributes["class"]
  as?: string
  asChild?: boolean
}>(), {
  side: "bottom",
  align: "end",
  as: "div",
})
</script>

<template>
  <Primitive
    data-slot="bubble-reactions"
    :data-side="side"
    :data-align="align"
    :as="as"
    :as-child="asChild"
    :class="cn(bubbleReactionsVariants({ side, align }), props.class)"
  >
    <slot />
  </Primitive>
</template>
