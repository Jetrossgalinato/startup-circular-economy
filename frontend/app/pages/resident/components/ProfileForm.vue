<script setup lang="ts">
import { toast } from 'vue-sonner'
import { AUTH_INPUT_CLASS, AUTH_MESSAGES, LOGOUT_REDIRECT_PATH } from '@/constants/auth'
import type { PayoutMethodPreference } from '@/types/auth'

const { profile, updateProfile, signOut } = useAuth()

const fullName = ref(profile.value?.full_name ?? '')
const phone = ref(profile.value?.phone ?? '')
const address = ref(profile.value?.address ?? '')
const defaultGcash = ref(profile.value?.default_gcash_number ?? '')
const defaultPayout = ref<PayoutMethodPreference | null>(
  profile.value?.default_payout_method ?? null,
)
const saving = ref(false)
const loggingOut = ref(false)

watch(profile, (next) => {
  if (!next) return
  fullName.value = next.full_name
  phone.value = next.phone ?? ''
  address.value = next.address ?? ''
  defaultGcash.value = next.default_gcash_number ?? ''
  defaultPayout.value = next.default_payout_method ?? null
})

const isDirty = computed(() => {
  const saved = profile.value
  if (!saved) {
    return true
  }

  const nextPhone = phone.value.trim() || null
  const nextAddress = address.value.trim() || null
  const nextGcash = defaultGcash.value.trim() || null

  return (
    fullName.value.trim() !== saved.full_name
    || nextPhone !== (saved.phone || null)
    || nextAddress !== (saved.address || null)
    || nextGcash !== (saved.default_gcash_number || null)
    || defaultPayout.value !== (saved.default_payout_method ?? null)
  )
})

const canSave = computed(() => isDirty.value && !saving.value)

async function save() {
  if (!canSave.value) {
    return
  }

  if (!fullName.value.trim()) {
    toast.error('Check your details', {
      description: 'Full name is required.',
    })
    return
  }

  saving.value = true
  try {
    await updateProfile({
      full_name: fullName.value.trim(),
      phone: phone.value.trim() || null,
      address: address.value.trim() || null,
      default_gcash_number: defaultGcash.value.trim() || null,
      default_payout_method: defaultPayout.value,
    })
    toast.success('Profile updated', {
      description: 'Your contact and payout preferences were saved.',
    })
  } catch (error) {
    toast.error('Could not save profile', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    saving.value = false
  }
}

async function handleLogout() {
  loggingOut.value = true
  try {
    await signOut()
    toast.success(AUTH_MESSAGES.logout.successTitle, {
      description: AUTH_MESSAGES.logout.success,
    })
    await navigateTo(LOGOUT_REDIRECT_PATH)
  } catch (error) {
    toast.error(AUTH_MESSAGES.logout.errorTitle, {
      description: error instanceof Error
        ? error.message
        : AUTH_MESSAGES.logout.genericError,
    })
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="save">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Your
        <span class="font-serif font-medium italic">profile</span>
      </h1>
      <p class="mt-1.5 text-sm text-muted-foreground">
        Used for pickup contact and default payout preferences.
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label for="full-name">Full name</Label>
      <Input id="full-name" v-model="fullName" :class="AUTH_INPUT_CLASS" />
    </div>

    <div class="flex flex-col gap-1.5">
      <Label for="phone">Phone</Label>
      <Input id="phone" v-model="phone" type="tel" placeholder="09XXXXXXXXX" :class="AUTH_INPUT_CLASS" />
    </div>

    <div class="flex flex-col gap-1.5">
      <Label for="address">Default address</Label>
      <textarea
        id="address"
        v-model="address"
        rows="3"
        class="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div>
      <p class="text-sm font-medium">Default payout</p>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <button
          v-for="option in [
            { value: 'gcash' as const, label: 'GCash' },
            { value: 'cash' as const, label: 'Cash' },
          ]"
          :key="option.value"
          type="button"
          class="rounded-full border px-3 py-2.5 text-sm font-medium"
          :class="defaultPayout === option.value
            ? 'border-foreground bg-foreground text-white'
            : 'border-neutral-200 bg-white'"
          @click="defaultPayout = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="defaultPayout === 'gcash'" class="flex flex-col gap-1.5">
      <Label for="default-gcash">Default GCash number</Label>
      <Input id="default-gcash" v-model="defaultGcash" type="tel" :class="AUTH_INPUT_CLASS" />
    </div>

    <Button
      type="submit"
      size="lg"
      :disabled="!canSave"
      class="h-11 w-full rounded-full bg-foreground text-white hover:bg-foreground/90 disabled:opacity-50"
    >
      {{ saving ? 'Saving…' : 'Save profile' }}
    </Button>

    <Button
      type="button"
      variant="outline"
      size="lg"
      :disabled="loggingOut"
      class="h-11 w-full rounded-full border-neutral-200"
      @click="handleLogout"
    >
      {{ loggingOut ? 'Signing out…' : 'Log out' }}
    </Button>
  </form>
</template>
