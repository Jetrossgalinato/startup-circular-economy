<script setup lang="ts">
import type { PayoutMethod } from '@/types/listings'
import { formatRatePerKg } from '@/utils/listings/format'
import { AUTH_INPUT_CLASS } from '@/constants/auth'

const props = defineProps<{
  categoryName: string
  ratePerKg: number
  tier: number
}>()

const payoutMethod = defineModel<PayoutMethod | null>('payoutMethod', { required: true })
const gcashNumber = defineModel<string>('gcashNumber', { required: true })
</script>

<template>
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">
      Accept
      <span class="font-serif font-medium italic">rate</span>
    </h2>
    <p class="mt-1.5 text-sm text-muted-foreground">
      You accept the published per-kilo rate. Final peso amount is calculated after logistics weighs your item at pickup.
    </p>

    <div class="mt-5 rounded-[1.5rem] bg-foreground p-5 text-white">
      <p class="text-[10px] font-semibold tracking-[0.16em] text-white/55 uppercase">
        Rate card
      </p>
      <p class="mt-1 text-sm text-white/80">
        {{ categoryName }} · Tier {{ tier }}
      </p>
      <p class="mt-3 text-3xl font-bold tracking-tight">
        {{ formatRatePerKg(ratePerKg) }}
      </p>
      <p class="mt-2 text-sm text-white/70">
        Final amount = weight (kg) × this rate after pickup.
      </p>
    </div>

    <div class="mt-6">
      <p class="text-sm font-medium">How should we pay you?</p>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="option in [
            { value: 'gcash' as const, label: 'GCash' },
            { value: 'cash' as const, label: 'Cash' },
          ]"
          :key="option.value"
          type="button"
          class="rounded-full border px-3 py-2.5 text-sm font-medium transition"
          :class="payoutMethod === option.value
            ? 'border-foreground bg-foreground text-white'
            : 'border-neutral-200 bg-white hover:border-neutral-300'"
          @click="payoutMethod = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="payoutMethod === 'gcash'" class="mt-4 flex flex-col gap-1.5">
      <Label for="gcash">GCash mobile number</Label>
      <Input
        id="gcash"
        v-model="gcashNumber"
        type="tel"
        placeholder="09XXXXXXXXX"
        :class="AUTH_INPUT_CLASS"
      />
    </div>

    <p v-else-if="payoutMethod === 'cash'" class="mt-3 text-sm text-muted-foreground">
      Cash is released after weigh-in at pickup / delivery confirmation.
    </p>
  </div>
</template>
