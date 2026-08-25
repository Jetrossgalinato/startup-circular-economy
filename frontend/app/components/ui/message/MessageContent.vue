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
    data-slot="message-content"
    :as="as"
    :as-child="asChild"
    :class="cn(
      'gap-2.5 group-data-[align=end]/message:*:data-slot:self-end flex w-full min-w-0 flex-col wrap-break-word',
      props.class,
    )"
  >
    <slot />
  </Primitive>
</template>
