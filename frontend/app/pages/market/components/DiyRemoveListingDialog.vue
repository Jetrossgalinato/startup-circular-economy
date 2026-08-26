<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  title?: string
  mode: 'delete' | 'unpublish'
  submitting?: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()

const heading = computed(() =>
  props.mode === 'delete' ? 'Remove listing' : 'Unpublish listing',
)

const copy = computed(() =>
  props.mode === 'delete'
    ? `Remove “${props.title || 'this listing'}”? This cannot be undone.`
    : `Unpublish “${props.title || 'this listing'}”? It will leave the market until you list it again.`,
)

function close() {
  if (props.submitting) {
    return
  }
  open.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      @click.self="close"
    >
      <div
        class="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="heading"
      >
        <h2 class="text-xl font-bold tracking-tight">
          {{ heading }}
        </h2>
        <p class="mt-1.5 text-sm text-muted-foreground">
          {{ copy }}
        </p>

        <div class="mt-5 flex gap-2">
          <Button
            type="button"
            variant="outline"
            class="h-11 flex-1 rounded-full border-neutral-200"
            :disabled="submitting"
            @click="close"
          >
            Keep listing
          </Button>
          <Button
            type="button"
            class="h-11 flex-1 rounded-full text-white"
            :class="mode === 'delete'
              ? 'bg-red-700 hover:bg-red-700/90'
              : 'bg-foreground hover:bg-foreground/90'"
            :disabled="submitting"
            @click="emit('confirm')"
          >
            {{ submitting
              ? (mode === 'delete' ? 'Removing…' : 'Unpublishing…')
              : (mode === 'delete' ? 'Remove' : 'Unpublish') }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
