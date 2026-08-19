<script setup lang="ts">
const inputClass = 'h-12 rounded-xl border-neutral-200 bg-white'
</script>

<template>
  <AuthShell>
    <form class="w-full max-w-md" @submit.prevent>
      <h2 class="text-3xl font-bold tracking-tight text-foreground">
        Change the way you handle your
        <span class="font-serif font-medium italic">e-waste</span>
      </h2>
      <p class="mt-2 text-sm leading-6 text-muted-foreground">
        Start selling, repairing, and upcycling with E-WISE.
      </p>

      <div class="mt-8 grid gap-5">
        <div class="flex flex-col gap-1.5">
          <Label for="name">Full name</Label>
          <Input id="name" type="text" placeholder="Ana Mercado" :class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" :class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="password">Password</Label>
          <Input id="password" type="password" :class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="confirm-password">Confirm password</Label>
          <Input id="confirm-password" type="password" :class="inputClass" />
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          class="h-12 w-full rounded-full bg-foreground text-base text-white hover:bg-foreground/90"
        >
          Sign Up
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          class="h-12 w-full rounded-full border-neutral-200 text-base"
        >
          Sign up with Google
        </Button>
      </div>

      <p class="mt-6 text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink to="/auth/login" class="font-medium text-foreground underline underline-offset-2">
          Login
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
