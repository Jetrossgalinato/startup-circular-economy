<script setup lang="ts">
import type { ListingCondition } from '@/types/listings'

const condition = defineModel<ListingCondition>({ required: true })

const flags: Array<{
  key: keyof ListingCondition
  label: string
  hint?: string
}> = [
  { key: 'swelling', label: 'Battery or case is swollen' },
  { key: 'leakage', label: 'Leakage visible' },
  { key: 'batteryHeatOrDamage', label: 'Battery feels hot or looks damaged' },
  { key: 'crackedCasing', label: 'Cracked casing' },
  { key: 'exposedWiring', label: 'Exposed wiring' },
  { key: 'crtGlass', label: 'CRT / leaded glass display' },
  { key: 'chemicalResidue', label: 'Chemical residue visible' },
  { key: 'fireOrHeatDamage', label: 'Fire or heat damage' },
  { key: 'radioactiveLabel', label: 'Radioactive labeling (e.g. smoke detector)' },
  { key: 'batteryPresent', label: 'Contains a battery' },
  { key: 'unknownCondition', label: 'Internal condition unknown' },
]

function toggle(key: keyof ListingCondition) {
  const current = condition.value[key]
  if (typeof current === 'boolean') {
    condition.value = { ...condition.value, [key]: !current }
  }
}

function setPowersOn(value: boolean | null) {
  condition.value = { ...condition.value, powersOn: value }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">
      Condition
      <span class="font-serif font-medium italic">check</span>
    </h2>
    <p class="mt-1.5 text-sm text-muted-foreground">
      Be honest — we bias toward safety. Hazardous flags route items to a dedicated track.
    </p>

    <div class="mt-5 space-y-2">
      <button
        v-for="flag in flags"
        :key="flag.key"
        type="button"
        class="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition"
        :class="condition[flag.key]
          ? 'border-foreground bg-foreground text-white'
          : 'border-neutral-200 bg-white text-foreground hover:border-neutral-300'"
        @click="toggle(flag.key)"
      >
        <span class="font-medium">{{ flag.label }}</span>
        <span
          class="flex size-5 items-center justify-center rounded-full border text-[10px]"
          :class="condition[flag.key] ? 'border-white/40' : 'border-neutral-300'"
        >
          {{ condition[flag.key] ? '✓' : '' }}
        </span>
      </button>
    </div>

    <div class="mt-5">
      <p class="text-sm font-medium">Does it power on?</p>
      <div class="mt-2 grid grid-cols-3 gap-2">
        <button
          v-for="option in [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
            { label: 'Unknown', value: null },
          ]"
          :key="String(option.label)"
          type="button"
          class="rounded-full border px-3 py-2 text-sm font-medium transition"
          :class="condition.powersOn === option.value
            ? 'border-foreground bg-foreground text-white'
            : 'border-neutral-200 bg-white hover:border-neutral-300'"
          @click="setPowersOn(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-1.5">
      <Label for="condition-notes">Notes (optional)</Label>
      <textarea
        id="condition-notes"
        v-model="condition.notes"
        rows="3"
        placeholder="Anything else logistics should know…"
        class="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  </div>
</template>
