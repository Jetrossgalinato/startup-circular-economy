<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { DiyOrder } from '@/types/diy'
import { formatListingDate, formatPeso } from '@/utils/listings/format'

const props = defineProps<{
  order: DiyOrder
  mode: 'resident' | 'collector' | 'admin'
  backTo: string
}>()

const { cancelOrder, rejectOrder, markPaid, fulfillOrder, completeOrder } = useDiyOrders()
const busy = ref(false)
const rejectReason = ref('')

async function run(action: () => Promise<unknown>, success: string) {
  if (busy.value) return
  busy.value = true
  try {
    await action()
    toast.success(success)
  } catch (error) {
    toast.error('Could not update order', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    busy.value = false
  }
}

async function copyGcash() {
  const number = props.order.collector_gcash_number
  if (!number) return
  try {
    await navigator.clipboard.writeText(number)
    toast.success('GCash number copied')
  } catch {
    toast.error('Could not copy')
  }
}
</script>

<template>
  <div>
    <NuxtLink :to="backTo" class="text-sm text-muted-foreground underline underline-offset-2">
      ← Back
    </NuxtLink>

    <div class="mt-4 rounded-[1.5rem] border border-neutral-200 p-5">
      <p class="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">DIY order</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight">{{ order.title }}</h1>
      <DiyStatusBadge kind="order" :status="order.status" class="mt-2" />
    </div>

    <div class="mt-3 grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Total</p>
        <p class="mt-1 text-lg font-semibold">{{ formatPeso(order.total_amount) }}</p>
      </div>
      <div class="rounded-2xl bg-neutral-50 p-4">
        <p class="text-xs text-muted-foreground">Qty</p>
        <p class="mt-1 text-lg font-semibold">{{ order.quantity }}</p>
      </div>
    </div>

    <div class="mt-4 space-y-2 text-sm">
      <p><span class="text-muted-foreground">Payment:</span> {{ order.payment_method === 'gcash' ? 'GCash' : 'Cash' }}</p>
      <p><span class="text-muted-foreground">Fulfillment:</span> {{ order.fulfillment_method === 'delivery' ? 'Delivery' : 'Pickup' }}</p>
      <p class="text-xs text-muted-foreground">{{ formatListingDate(order.created_at) }}</p>
    </div>

    <div v-if="order.payment_method === 'gcash'" class="mt-4 rounded-2xl border border-neutral-200 p-4">
      <p class="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Collector GCash</p>
      <p class="mt-1 font-semibold">{{ order.collector_gcash_number || '—' }}</p>
      <button
        v-if="order.collector_gcash_number"
        type="button"
        class="mt-1 text-xs font-medium underline underline-offset-2"
        @click="copyGcash"
      >
        Copy number
      </button>
    </div>

    <div class="mt-4 rounded-2xl border border-neutral-200 p-4 text-sm">
      <p class="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {{ order.fulfillment_method === 'delivery' ? 'Deliver to resident' : 'Pickup from collector' }}
      </p>
      <template v-if="order.fulfillment_method === 'delivery'">
        <p class="mt-1 font-medium">{{ order.resident_name }}</p>
        <p>{{ order.resident_phone }}</p>
        <p class="whitespace-pre-wrap">{{ order.delivery_address }}</p>
      </template>
      <template v-else>
        <p class="mt-1 font-medium">{{ order.collector_name }}</p>
        <p>{{ order.collector_phone }}</p>
        <p class="whitespace-pre-wrap">{{ order.collector_address }}</p>
      </template>
    </div>

    <p v-if="order.rejection_reason" class="mt-3 text-sm text-red-700">
      {{ order.rejection_reason }}
    </p>

    <div v-if="mode === 'resident'" class="mt-6 space-y-2">
      <Button
        v-if="order.status === 'pending_payment'"
        variant="outline"
        class="h-11 w-full rounded-full"
        :disabled="busy"
        @click="run(() => cancelOrder(order.id), 'Order cancelled')"
      >
        Cancel order
      </Button>
      <Button
        v-if="order.status === 'ready' || order.status === 'out_for_delivery'"
        class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90"
        :disabled="busy"
        @click="run(() => completeOrder(order.id), 'Marked received')"
      >
        Mark received
      </Button>
    </div>

    <div v-if="mode === 'collector'" class="mt-6 space-y-3">
      <Button
        v-if="order.status === 'pending_payment'"
        class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90"
        :disabled="busy"
        @click="run(() => markPaid(order.id), 'Payment recorded')"
      >
        Mark paid
      </Button>
      <Button
        v-if="order.status === 'paid'"
        class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90"
        :disabled="busy"
        @click="run(() => fulfillOrder(order.id), order.fulfillment_method === 'delivery' ? 'Out for delivery' : 'Ready for pickup')"
      >
        {{ order.fulfillment_method === 'delivery' ? 'Out for delivery' : 'Ready for pickup' }}
      </Button>
      <template v-if="order.status === 'pending_payment'">
        <textarea
          v-model="rejectReason"
          rows="2"
          class="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          placeholder="Reject reason (optional)"
        />
        <Button
          variant="outline"
          class="h-11 w-full rounded-full"
          :disabled="busy"
          @click="run(() => rejectOrder(order.id, rejectReason), 'Order rejected')"
        >
          Reject order
        </Button>
      </template>
    </div>
  </div>
</template>
