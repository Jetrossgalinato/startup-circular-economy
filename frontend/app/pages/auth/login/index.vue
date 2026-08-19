<script setup lang="ts">
const inputClass = 'h-12 rounded-xl border-neutral-200 bg-white'
</script>

<template>
  <AuthShell>
    <form @submit.prevent>
      <h2 class="text-3xl font-bold tracking-tight text-foreground">
        Sign in to handle your
        <span class="font-serif font-medium italic">e-waste</span>
      </h2>
      <p class="mt-2 text-sm leading-6 text-muted-foreground">
        Enter your email and password to continue.
      </p>

      <div class="mt-8 grid gap-5">
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" :class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a
              href="#"
              class="ml-auto text-sm text-muted-foreground underline underline-offset-2"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" :class="inputClass" />
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          class="h-12 w-full rounded-full bg-foreground text-base text-white hover:bg-foreground/90"
        >
          Login
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          class="h-12 w-full rounded-full border-neutral-200 text-base"
        >
          Login with Google
        </Button>
      </div>

      <p class="mt-6 text-sm text-muted-foreground">
        Don’t have an account?
        <NuxtLink to="/auth/register" class="font-medium text-foreground underline underline-offset-2">
          Sign up
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
