<script setup lang="ts">
import { toast } from 'vue-sonner'
import { AUTH_INPUT_CLASS, AUTH_MESSAGES } from '@/constants/auth'
import { validateLoginForm } from '@/utils/auth'

definePageMeta({
  middleware: 'auth',
})

const { signIn, redirectToRoleHome } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleSubmit() {
  const validationError = validateLoginForm({
    email: email.value,
    password: password.value,
  })

  if (validationError) {
    toast.error(AUTH_MESSAGES.login.validationTitle, {
      description: validationError,
    })
    return
  }

  loading.value = true

  try {
    await signIn({
      email: email.value.trim(),
      password: password.value,
    })

    toast.success(AUTH_MESSAGES.login.successTitle, {
      description: AUTH_MESSAGES.login.success,
    })
    await redirectToRoleHome()
  } catch (error) {
    toast.error(AUTH_MESSAGES.login.errorTitle, {
      description: error instanceof Error
        ? error.message
        : AUTH_MESSAGES.login.genericError,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell>
    <form @submit.prevent="handleSubmit">
      <h2 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Sign in to handle your
        <span class="font-serif font-medium italic">e-waste</span>
      </h2>
      <p class="mt-1.5 text-sm leading-5 text-muted-foreground sm:mt-2 sm:leading-6">
        Enter your email and password to continue.
      </p>

      <div class="mt-5 grid gap-3.5 sm:mt-8 sm:gap-5">
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email</Label>
          <Input id="email" v-model="email" type="email" placeholder="m@example.com" :class="AUTH_INPUT_CLASS" />
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a
              href="#"
              class="ml-auto text-xs text-muted-foreground underline underline-offset-2 sm:text-sm"
            >
              Forgot your password?
            </a>
          </div>
          <PasswordInput id="password" v-model="password" :input-class="AUTH_INPUT_CLASS" />
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:gap-3">
        <Button
          type="submit"
          size="lg"
          :disabled="loading"
          class="h-10 w-full rounded-full bg-foreground text-sm text-white hover:bg-foreground/90 sm:h-12 sm:text-base"
        >
          {{ loading ? AUTH_MESSAGES.login.submitting : AUTH_MESSAGES.login.submit }}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled
          class="h-10 w-full rounded-full border-neutral-200 text-sm sm:h-12 sm:text-base"
        >
          Login with Google
        </Button>
      </div>

      <p class="mt-4 text-sm text-muted-foreground sm:mt-6">
        Don’t have an account?
        <NuxtLink to="/auth/register" class="font-medium text-foreground underline underline-offset-2">
          Sign up
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
