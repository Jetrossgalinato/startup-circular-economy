<script setup lang="ts">
const inputClass = 'h-10 rounded-xl border-neutral-200 bg-white sm:h-12'
const selectTriggerClass = 'h-10 rounded-xl border-neutral-200 bg-white sm:h-12'

const roles = [
  { value: 'resident', label: 'Resident' },
  { value: 'admin', label: 'Admin' },
  { value: 'collector', label: 'Collector' },
]

const role = ref<string>()
</script>

<template>
  <AuthShell>
    <form @submit.prevent>
      <h2 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Change the way you handle your <br />
        <span class="font-serif font-medium italic">e-waste</span>
      </h2>
      <p class="mt-1.5 text-sm leading-5 text-muted-foreground sm:mt-2 sm:leading-6">
        Join the MVP B2C sell flow — list e-waste, get a per-kilo rate, and move items through E-WISE cross-dock intake.
      </p>

      <div class="mt-5 grid gap-3.5 sm:mt-8 sm:gap-5">
        <div class="flex flex-col gap-1.5">
          <Label for="name">Full name</Label>
          <Input id="name" type="text" placeholder="Ana Mercado" :class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" :class="inputClass" />
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
          <PasswordInput id="password" :input-class="inputClass" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="confirm-password">Confirm password</Label>
          <PasswordInput id="confirm-password" :input-class="inputClass" />
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:gap-3">
        <Button
          type="submit"
          size="lg"
          class="h-10 w-full rounded-full bg-foreground text-sm text-white hover:bg-foreground/90 sm:h-12 sm:text-base"
        >
          Sign Up
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
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
