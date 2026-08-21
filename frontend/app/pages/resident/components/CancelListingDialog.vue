<script setup lang="ts">
import {
  CANCELLATION_REASON_OPTIONS,
  formatCancellationReason,
  type CancellationReasonValue,
} from '@/types/listings'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  submitting?: boolean
  title?: string
}>()

const emit = defineEmits<{
  confirm: [reason: string]
}>()

const selected = ref<CancellationReasonValue | null>(null)
const details = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    selected.value = null
    details.value = ''
  }
})

const canSubmit = computed(() => {
  if (!selected.value || props.submitting) {
    return false
  }
  if (selected.value === 'other') {
    return details.value.trim().length >= 3
  }
  return true
})

function close() {
  if (props.submitting) {
    return
  }
  open.value = false
}

function submit() {
  if (!selected.value || !canSubmit.value) {
    return
  }
  emit('confirm', formatCancellationReason(selected.value, details.value))
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
        :aria-label="title || 'Cancel listing'"
      >
        <h2 class="text-xl font-bold tracking-tight">
          {{ title || 'Cancel listing' }}
        </h2>
        <p class="mt-1.5 text-sm text-muted-foreground">
          Tell us why you’re cancelling. Logistics will not pick this item up.
        </p>

        <div class="mt-5 space-y-2">
          <button
            v-for="option in CANCELLATION_REASON_OPTIONS"
            :key="option.value"
            type="button"
            class="w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition"
            :class="selected === option.value
              ? 'border-foreground bg-foreground text-white'
              : 'border-neutral-200 bg-white hover:border-neutral-300'"
            @click="selected = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="mt-4 flex flex-col gap-1.5">
          <Label for="cancel-details">
            {{ selected === 'other' ? 'Please describe' : 'Extra details (optional)' }}
          </Label>
          <textarea
            id="cancel-details"
            v-model="details"
            rows="3"
            :placeholder="selected === 'other' ? 'Why are you cancelling?' : 'Anything else we should know…'"
            class="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

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
            class="h-11 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ submitting ? 'Cancelling…' : 'Confirm cancel' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
