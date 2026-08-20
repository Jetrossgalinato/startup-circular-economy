<script setup lang="ts">
import { toast } from 'vue-sonner'
import {
  AUTH_INPUT_CLASS,
  AUTH_MESSAGES,
  AUTH_SELECT_TRIGGER_CLASS,
  REGISTER_ROLES,
} from '@/constants/auth'
import type { UserRole } from '@/types/auth'
import { validateRegisterForm } from '@/utils/auth'

definePageMeta({
  middleware: 'auth',
})

const { signUp, redirectToRoleHome } = useAuth()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref<UserRole>()
const loading = ref(false)

async function handleSubmit() {
  const validationError = validateRegisterForm({
    fullName: fullName.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    role: role.value,
  })

  if (validationError) {
    toast.error(validationError)
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
      toast.success(AUTH_MESSAGES.register.success)
      await redirectToRoleHome()
      return
    }

    toast.success(AUTH_MESSAGES.register.successEmailConfirmation)
  } catch (error) {
    toast.error(error instanceof Error
      ? error.message
      : AUTH_MESSAGES.register.genericError)
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
        Join the community and start handling your e-waste <br /> with E-WISE.
      </p>

      <div class="mt-5 grid gap-3.5 sm:mt-8 sm:gap-5">
        <div class="flex flex-col gap-1.5">
          <Label for="name">Full name</Label>
          <Input id="name" v-model="fullName" type="text" placeholder="Ana Mercado" :class="AUTH_INPUT_CLASS" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email</Label>
          <Input id="email" v-model="email" type="email" placeholder="m@example.com" :class="AUTH_INPUT_CLASS" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="role">Role</Label>
          <Select v-model="role" required>
            <SelectTrigger id="role" :class="AUTH_SELECT_TRIGGER_CLASS">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in REGISTER_ROLES"
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
          <PasswordInput id="password" v-model="password" :input-class="AUTH_INPUT_CLASS" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="confirm-password">Confirm password</Label>
          <PasswordInput id="confirm-password" v-model="confirmPassword" :input-class="AUTH_INPUT_CLASS" />
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:gap-3">
        <Button
          type="submit"
          size="lg"
          :disabled="loading"
          class="h-10 w-full rounded-full bg-foreground text-sm text-white hover:bg-foreground/90 sm:h-12 sm:text-base"
        >
          {{ loading ? AUTH_MESSAGES.register.submitting : AUTH_MESSAGES.register.submit }}
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
