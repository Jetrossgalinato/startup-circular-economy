<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { MarkerVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { markerVariants } from "."

const props = withDefaults(defineProps<{
  variant?: MarkerVariants["variant"]
  class?: HTMLAttributes["class"]
  as?: string
  asChild?: boolean
}>(), {
  as: "div",
})
</script>

<template>
  <Primitive
    data-slot="marker"
    :data-variant="variant"
    :as="as"
    :as-child="asChild"
    :class="cn(markerVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
