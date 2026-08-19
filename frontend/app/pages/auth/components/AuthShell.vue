<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-foreground">
    <header class="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6 sm:py-6">
      <NuxtLink to="/" class="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        E-WISE
      </NuxtLink>

      <div class="flex items-center gap-1.5 sm:gap-3">
        <Button variant="ghost" as="a" href="/auth/login" class="text-sm font-medium text-foreground">
          Login
        </Button>
        <Button
          as="a"
          href="/auth/register"
          class="h-9 rounded-full bg-foreground px-3.5 text-sm text-white hover:bg-foreground/90 sm:h-10 sm:px-5"
        >
          Sign Up
          <ChevronRight class="hidden size-4 sm:block" />
        </Button>
      </div>
    </header>

    <section class="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div class="w-full max-w-sm sm:max-w-md">
        <slot />
      </div>
    </section>
  </div>
</template>
