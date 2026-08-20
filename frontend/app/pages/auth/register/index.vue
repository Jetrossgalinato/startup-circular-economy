<script setup lang="ts">
import type { UserRole } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth',
})

const inputClass = 'h-10 rounded-xl border-neutral-200 bg-white sm:h-12'
const selectTriggerClass = 'h-10 rounded-xl border-neutral-200 bg-white sm:h-12'

const roles: { value: UserRole, label: string }[] = [
  { value: 'resident', label: 'Resident' },
  { value: 'admin', label: 'Admin' },
  { value: 'collector', label: 'Collector' },
]

const { signUp } = useAuth()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref<UserRole>()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function validateForm() {
  if (!fullName.value.trim()) {
    return 'Full name is required.'
  }

  if (!email.value.trim()) {
    return 'Email is required.'
  }

  if (!role.value) {
    return 'Select a role to continue.'
  }

  if (password.value.length < 6) {
    return 'Password must be at least 6 characters.'
  }

  if (password.value !== confirmPassword.value) {
    return 'Passwords do not match.'
  }

  return null
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  loading.value = true

  try {
    const data = await signUp({
      email: email.value.trim(),
      password: password.value,
      fullName: fullName.value.trim(),
      role: role.value as UserRole,
    })

    if (data.session) {
      await navigateTo('/')
      return
    }

    successMessage.value = 'Check your email to confirm your account, then sign in.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to create account.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell>
    <form @submit.prevent="handleSubmit">
      <h2 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Change the way you handle your <br />
        <span class="font-serif font-medium italic">e-waste</span>
      </h2>
      <p class="mt-1.5 text-sm leading-5 text-muted-foreground sm:mt-2 sm:leading-6">
        Join the MVP B2C sell flow — list e-waste, get a per-kilo rate, and move items through E-WISE cross-dock intake.
      </p>

      <p
        v-if="errorMessage"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>

      <p
        v-if="successMessage"
        class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
      >
        {{ successMessage }}
      </p>

      <div class="mt-5 grid gap-3.5 sm:mt-8 sm:gap-5">
        <div class="flex flex-col gap-1.5">
          <Label for="name">Full name</Label>
          <Input id="name" v-model="fullName" type="text" placeholder="Ana Mercado" :class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email</Label>
          <Input id="email" v-model="email" type="email" placeholder="m@example.com" :class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="role">Role</Label>
          <Select v-model="role" required>
            <SelectTrigger id="role" :class="selectTriggerClass">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in roles"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="password">Password</Label>
          <PasswordInput id="password" v-model="password" :input-class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="confirm-password">Confirm password</Label>
          <PasswordInput id="confirm-password" v-model="confirmPassword" :input-class="inputClass" />
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:gap-3">
        <Button
          type="submit"
          size="lg"
          :disabled="loading"
          class="h-10 w-full rounded-full bg-foreground text-sm text-white hover:bg-foreground/90 sm:h-12 sm:text-base"
        >
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled
          class="h-10 w-full rounded-full border-neutral-200 text-sm sm:h-12 sm:text-base"
        >
          Sign up with Google
        </Button>
      </div>

      <p class="mt-4 text-sm text-muted-foreground sm:mt-6">
        Already have an account?
        <NuxtLink to="/auth/login" class="font-medium text-foreground underline underline-offset-2">
          Login
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
