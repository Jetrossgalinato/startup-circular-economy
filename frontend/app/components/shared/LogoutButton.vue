<script setup lang="ts">
import { toast } from 'vue-sonner'
import { AUTH_MESSAGES, LOGOUT_REDIRECT_PATH } from '@/constants/auth'

const { signOut } = useAuth()

const loading = ref(false)

async function handleLogout() {
  loading.value = true

  try {
    await signOut()
    toast.success(AUTH_MESSAGES.logout.success)
    await navigateTo(LOGOUT_REDIRECT_PATH)
  } catch (error) {
    toast.error(error instanceof Error
      ? error.message
      : AUTH_MESSAGES.logout.genericError)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Button
    type="button"
    variant="outline"
    :disabled="loading"
    class="rounded-full border-neutral-200"
    @click="handleLogout"
  >
    {{ loading ? 'Logging out...' : 'Log out' }}
  </Button>
</template>
