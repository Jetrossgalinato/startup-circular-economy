<script setup lang="ts">
import { ImagePlus, X } from '@lucide/vue'

const props = defineProps<{
  files: File[]
  previews: string[]
}>()

const emit = defineEmits<{
  add: [files: File[]]
  remove: [index: number]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files ?? [])
  if (selected.length) {
    emit('add', selected)
  }
  input.value = ''
}
</script>

<template>
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">
      Add clear
      <span class="font-serif font-medium italic">photos</span>
    </h2>
    <p class="mt-1.5 text-sm text-muted-foreground">
      Include the whole device, any damage, and the battery compartment if visible.
    </p>

    <div class="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
      <button
        type="button"
        class="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-foreground/60 transition hover:border-foreground/40 hover:bg-neutral-100"
        @click="inputRef?.click()"
      >
        <ImagePlus class="size-6" />
        <span class="text-[10px] font-medium sm:text-xs">Add</span>
      </button>

      <div
        v-for="(preview, index) in props.previews"
        :key="`${preview}-${index}`"
        class="relative aspect-square overflow-hidden rounded-2xl bg-neutral-200"
      >
        <img :src="preview" alt="" class="size-full object-cover">
        <button
          type="button"
          class="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-foreground/80 text-white"
          aria-label="Remove photo"
          @click="emit('remove', index)"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </div>

    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onPick"
    >

    <p v-if="props.files.length === 0" class="mt-3 text-xs text-muted-foreground">
      At least one photo is required.
    </p>
  </div>
</template>
