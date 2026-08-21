<script setup lang="ts">
import { AUTH_INPUT_CLASS } from '@/constants/auth'

const address = defineModel<string>('address', { required: true })
const windowPref = defineModel<string>('windowPref', { required: true })
const notes = defineModel<string>('notes', { required: true })

const windows = [
  'Today · morning (8am–12pm)',
  'Today · afternoon (12pm–5pm)',
  'Tomorrow · morning (8am–12pm)',
  'Tomorrow · afternoon (12pm–5pm)',
  'This weekend',
]
</script>

<template>
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">
      Schedule
      <span class="font-serif font-medium italic">pickup</span>
    </h2>
    <p class="mt-1.5 text-sm text-muted-foreground">
      Piloting in Butuan City. Logistics picks up from you — collectors never contact you directly.
    </p>

    <div class="mt-5 flex flex-col gap-1.5">
      <Label for="pickup-address">Pickup address</Label>
      <textarea
        id="pickup-address"
        v-model="address"
        rows="3"
        placeholder="Barangay, street, landmarks…"
        class="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div class="mt-4">
      <p class="text-sm font-medium">Preferred window</p>
      <div class="mt-2 space-y-2">
        <button
          v-for="option in windows"
          :key="option"
          type="button"
          class="w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition"
          :class="windowPref === option
            ? 'border-foreground bg-foreground text-white'
            : 'border-neutral-200 bg-white hover:border-neutral-300'"
          @click="windowPref = option"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-1.5">
      <Label for="pickup-notes">Notes for logistics (optional)</Label>
      <Input
        id="pickup-notes"
        v-model="notes"
        placeholder="Gate code, best contact, heavy item help…"
        :class="AUTH_INPUT_CLASS"
      />
    </div>
  </div>
</template>
