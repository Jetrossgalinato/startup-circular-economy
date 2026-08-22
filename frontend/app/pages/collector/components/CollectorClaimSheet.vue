<script setup lang="ts">
import type { FulfillmentMethod } from '@/types/listings'

const fulfillment = defineModel<FulfillmentMethod>('fulfillment', { default: 'pickup' })

defineProps<{
  profileAddress: string
}>()
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm font-medium">How do you want it?</p>
    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        class="rounded-2xl border px-3 py-3 text-left text-sm font-medium"
        :class="fulfillment === 'pickup'
          ? 'border-foreground bg-foreground text-white'
          : 'border-neutral-200 bg-white'"
        @click="fulfillment = 'pickup'"
      >
        Pickup
        <span class="mt-1 block text-xs font-normal opacity-80">
          Butuan cross-dock
        </span>
      </button>
      <button
        type="button"
        class="rounded-2xl border px-3 py-3 text-left text-sm font-medium"
        :class="fulfillment === 'delivery'
          ? 'border-foreground bg-foreground text-white'
          : 'border-neutral-200 bg-white'"
        @click="fulfillment = 'delivery'"
      >
        Delivery
        <span class="mt-1 block text-xs font-normal opacity-80">
          To your address
        </span>
      </button>
    </div>

    <p v-if="fulfillment === 'pickup'" class="text-sm text-muted-foreground">
      Collect at the company cross-dock in Butuan City. Collectors never go to the resident.
    </p>
    <div v-else class="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <p class="text-xs font-medium text-muted-foreground">Deliver to</p>
      <p v-if="profileAddress" class="mt-1 whitespace-pre-wrap text-sm text-foreground">
        {{ profileAddress }}
      </p>
      <p v-else class="mt-1 text-sm text-muted-foreground">
        Add a phone and address on your profile before claiming delivery.
      </p>
      <NuxtLink
        to="/collector/profile"
        class="mt-2 inline-block text-sm font-medium underline underline-offset-2"
      >
        Edit profile
      </NuxtLink>
    </div>
  </div>
</template>
