<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-foreground">
    <header class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
      <NuxtLink to="/" class="text-xl font-semibold tracking-tight text-foreground">
        E-WISE
      </NuxtLink>

      <div class="flex items-center gap-3">
        <Button variant="ghost" as="a" href="/auth/login" class="text-sm font-medium text-foreground">
          Login
        </Button>
        <Button
          as="a"
          href="/auth/register"
          class="h-10 rounded-full bg-foreground px-5 text-sm text-white hover:bg-foreground/90"
        >
          Sign Up
          <ChevronRight class="size-4" />
        </Button>
      </div>
    </header>

    <section class="flex flex-1 items-center justify-center px-6 py-8 lg:py-10">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </section>
  </div>
</template>
