<script setup lang="ts">
import { LOGOUT_REDIRECT_PATH } from '@/constants/auth'

const { signOut } = useAuth()

const loading = ref(false)

async function handleLogout() {
  loading.value = true

  try {
    await signOut()
    await navigateTo(LOGOUT_REDIRECT_PATH)
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
