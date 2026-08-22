<script setup lang="ts">
import { toast } from 'vue-sonner'
import { AUTH_INPUT_CLASS, AUTH_MESSAGES, LOGOUT_REDIRECT_PATH } from '@/constants/auth'

const { profile, updateProfile, signOut } = useAuth()

const fullName = ref(profile.value?.full_name ?? '')
const phone = ref(profile.value?.phone ?? '')
const address = ref(profile.value?.address ?? '')
const saving = ref(false)
const loggingOut = ref(false)

watch(profile, (next) => {
  if (!next) return
  fullName.value = next.full_name
  phone.value = next.phone ?? ''
  address.value = next.address ?? ''
})

const isDirty = computed(() => {
  const saved = profile.value
  if (!saved) {
    return true
  }
  return (
    fullName.value.trim() !== saved.full_name
    || (phone.value.trim() || null) !== (saved.phone || null)
    || (address.value.trim() || null) !== (saved.address || null)
  )
})

async function save() {
  if (!isDirty.value || saving.value) {
    return
  }
  if (!fullName.value.trim()) {
    toast.error('Name required', {
      description: 'Enter the name for this collector account.',
    })
    return
  }

  saving.value = true
  try {
    await updateProfile({
      full_name: fullName.value.trim(),
      phone: phone.value.trim() || null,
      address: address.value.trim() || null,
    })
    toast.success('Profile updated', {
      description: 'Delivery claims will use this address.',
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
        Collector
        <span class="font-serif font-medium italic">profile</span>
      </h1>
      <p class="mt-1.5 text-sm text-muted-foreground">
        Phone and address are required if you want lots delivered.
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label for="full-name">Full name</Label>
      <Input id="full-name" v-model="fullName" :class="AUTH_INPUT_CLASS" />
    </div>
    <div class="flex flex-col gap-1.5">
      <Label for="phone">Phone</Label>
      <Input id="phone" v-model="phone" type="tel" :class="AUTH_INPUT_CLASS" />
    </div>
    <div class="flex flex-col gap-1.5">
      <Label for="address">Address</Label>
      <textarea
        id="address"
        v-model="address"
        rows="3"
        class="min-h-24 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
      />
    </div>

    <Button
      type="submit"
      size="lg"
      :disabled="!isDirty || saving"
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
