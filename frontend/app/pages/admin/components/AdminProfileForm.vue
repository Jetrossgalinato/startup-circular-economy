<script setup lang="ts">
import { toast } from 'vue-sonner'
import { AUTH_INPUT_CLASS, AUTH_MESSAGES, LOGOUT_REDIRECT_PATH } from '@/constants/auth'

const { profile, updateProfile, signOut } = useAuth()

const fullName = ref(profile.value?.full_name ?? '')
const saving = ref(false)
const loggingOut = ref(false)

watch(profile, (next) => {
  if (!next) return
  fullName.value = next.full_name
})

const isDirty = computed(() =>
  fullName.value.trim() !== (profile.value?.full_name ?? ''),
)

async function save() {
  if (!isDirty.value || saving.value) {
    return
  }
  if (!fullName.value.trim()) {
    toast.error('Name required', {
      description: 'Enter the name that appears on intake records.',
    })
    return
  }

  saving.value = true
  try {
    await updateProfile({ full_name: fullName.value.trim() })
    toast.success('Profile updated', {
      description: 'Your admin display name was saved.',
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
        Admin
        <span class="font-serif font-medium italic">profile</span>
      </h1>
      <p class="mt-1.5 text-sm text-muted-foreground">
        Operations account for cross-dock intake in Butuan City.
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label for="full-name">Full name</Label>
      <Input id="full-name" v-model="fullName" :class="AUTH_INPUT_CLASS" />
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
