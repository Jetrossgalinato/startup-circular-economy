<script setup lang="ts">
import { toast } from 'vue-sonner'
import { AUTH_INPUT_CLASS } from '@/constants/auth'
import type { DiyFulfillmentMethod, DiyPaymentMethod, DiyProduct } from '@/types/diy'
import { formatPeso } from '@/utils/listings/format'

const props = defineProps<{
  product: DiyProduct
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  placed: [orderId: string]
}>()

const { profile } = useAuth()
const { placeOrder } = useDiyOrders()

const quantity = ref(1)
const paymentMethod = ref<DiyPaymentMethod>('gcash')
const fulfillmentMethod = ref<DiyFulfillmentMethod>('pickup')
const phone = ref('')
const deliveryAddress = ref('')
const notes = ref('')
const submitting = ref(false)

watch(() => props.open, (open) => {
  if (!open) return
  quantity.value = 1
  paymentMethod.value = 'gcash'
  fulfillmentMethod.value = 'pickup'
  phone.value = profile.value?.phone ?? ''
  deliveryAddress.value = profile.value?.address ?? ''
  notes.value = ''
})

const maxQty = computed(() => Math.max(1, props.product.stock))
const total = computed(() => props.product.price * quantity.value)
const gcashNumber = computed(() => props.product.collector_gcash_number?.trim() || '')

const canSubmit = computed(() => {
  if (submitting.value || props.product.stock < 1) return false
  if (paymentMethod.value === 'gcash' && !gcashNumber.value) return false
  if (fulfillmentMethod.value === 'delivery') {
    return phone.value.trim().length >= 7 && deliveryAddress.value.trim().length >= 8
  }
  return true
})

function close() {
  emit('update:open', false)
}

async function copyGcash() {
  if (!gcashNumber.value) return
  try {
    await navigator.clipboard.writeText(gcashNumber.value)
    toast.success('GCash number copied')
  } catch {
    toast.error('Could not copy')
  }
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const order = await placeOrder({
      productId: props.product.id,
      quantity: quantity.value,
      paymentMethod: paymentMethod.value,
      fulfillmentMethod: fulfillmentMethod.value,
      residentPhone: phone.value.trim(),
      deliveryAddress: deliveryAddress.value.trim(),
      notes: notes.value.trim() || undefined,
    })
    toast.success('Order placed', {
      description: paymentMethod.value === 'gcash'
        ? 'Send GCash to the number shown, then wait for the collector to mark it paid.'
        : 'Pay cash at pickup or delivery. The collector will mark it paid.',
    })
    emit('placed', order.id)
    close()
  } catch (error) {
    toast.error('Could not place order', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    submitting.value = false
  }
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
        class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[1.75rem] bg-white p-5 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
      >
        <h3 class="text-lg font-bold tracking-tight">Buy {{ product.title }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">
          One product per checkout. {{ formatPeso(product.price) }} each.
        </p>

        <div class="mt-4">
          <p class="text-sm font-medium">Quantity</p>
          <div class="mt-2 flex items-center gap-3">
            <Button type="button" variant="outline" class="size-9 rounded-full" :disabled="quantity <= 1" @click="quantity = Math.max(1, quantity - 1)">−</Button>
            <span class="w-8 text-center text-sm font-semibold">{{ quantity }}</span>
            <Button type="button" variant="outline" class="size-9 rounded-full" :disabled="quantity >= maxQty" @click="quantity = Math.min(maxQty, quantity + 1)">+</Button>
          </div>
        </div>

        <div class="mt-4">
          <p class="text-sm font-medium">Payment</p>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-2xl border px-3 py-3 text-left text-sm font-medium"
              :class="paymentMethod === 'gcash' ? 'border-foreground bg-foreground text-white' : 'border-neutral-200'"
              @click="paymentMethod = 'gcash'"
            >
              GCash
            </button>
            <button
              type="button"
              class="rounded-2xl border px-3 py-3 text-left text-sm font-medium"
              :class="paymentMethod === 'cash' ? 'border-foreground bg-foreground text-white' : 'border-neutral-200'"
              @click="paymentMethod = 'cash'"
            >
              Cash
            </button>
          </div>
          <div v-if="paymentMethod === 'gcash'" class="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <p class="text-xs font-medium text-muted-foreground">
              Send GCash to {{ product.collector_name || 'the collector' }}
            </p>
            <p class="mt-1 font-semibold tracking-wide">{{ gcashNumber || 'No GCash number on file' }}</p>
            <button v-if="gcashNumber" type="button" class="mt-1 text-xs font-medium underline underline-offset-2" @click="copyGcash">
              Copy number
            </button>
            <p class="mt-2 text-xs text-muted-foreground">
              The app only records the order. It does not send money.
            </p>
          </div>
          <p v-else class="mt-2 text-xs text-muted-foreground">
            Pay cash when you pick up or when the collector delivers.
          </p>
        </div>

        <div class="mt-4">
          <p class="text-sm font-medium">How you get it</p>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-2xl border px-3 py-3 text-left text-sm font-medium"
              :class="fulfillmentMethod === 'pickup' ? 'border-foreground bg-foreground text-white' : 'border-neutral-200'"
              @click="fulfillmentMethod = 'pickup'"
            >
              Pickup
              <span class="mt-1 block text-xs font-normal opacity-80">At the collector</span>
            </button>
            <button
              type="button"
              class="rounded-2xl border px-3 py-3 text-left text-sm font-medium"
              :class="fulfillmentMethod === 'delivery' ? 'border-foreground bg-foreground text-white' : 'border-neutral-200'"
              @click="fulfillmentMethod = 'delivery'"
            >
              Delivery
              <span class="mt-1 block text-xs font-normal opacity-80">To your address</span>
            </button>
          </div>
          <div v-if="fulfillmentMethod === 'pickup'" class="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <p class="text-xs font-medium text-muted-foreground">Pickup from</p>
            <p class="mt-1 whitespace-pre-wrap text-sm">{{ product.collector_address || 'Address not listed yet' }}</p>
            <p v-if="product.collector_phone" class="mt-1 text-sm">{{ product.collector_phone }}</p>
          </div>
          <div v-else class="mt-3 space-y-3">
            <div class="flex flex-col gap-1.5">
              <Label for="checkout-phone">Phone</Label>
              <Input id="checkout-phone" v-model="phone" type="tel" :class="AUTH_INPUT_CLASS" />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label for="checkout-address">Delivery address</Label>
              <textarea
                id="checkout-address"
                v-model="deliveryAddress"
                rows="3"
                class="min-h-20 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <p class="mt-4 text-sm font-semibold">Total {{ formatPeso(total) }}</p>

        <div class="mt-5 flex gap-2">
          <Button type="button" variant="outline" class="h-11 flex-1 rounded-full" @click="close">Cancel</Button>
          <Button
            type="button"
            class="h-11 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ submitting ? 'Placing…' : 'Place order' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
