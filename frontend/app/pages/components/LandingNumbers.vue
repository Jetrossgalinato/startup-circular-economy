<script setup lang="ts">
import landingBgNumbers from '~/assets/images/landing_bg_numbers.jpg'
</script>

<template>
  <section class="bg-white px-4 pb-16 sm:px-6 sm:pb-24 lg:pb-25">
    <div
      class="mx-auto max-w-6xl overflow-hidden rounded-b-2xl border-b border-neutral-200 bg-cover bg-center px-5 py-8 text-white sm:px-10 sm:py-11"
      :style="{ backgroundImage: `url(${landingBgNumbers})` }"
    >
      <div class="grid gap-8 text-center lg:grid-cols-3 lg:items-center lg:text-left">
        <div>
          <p class="text-3xl font-bold tracking-tight sm:text-5xl">2,400 kg</p>
          <p class="mt-2 text-sm text-white/75 sm:text-base">E-waste recovered</p>
        </div>
        <div>
          <p class="text-3xl font-bold tracking-tight sm:text-5xl">7+</p>
          <p class="mt-2 text-sm text-white/75 sm:text-base">Device categories on the rate card</p>
        </div>
        <div>
          <p class="text-xs font-semibold tracking-[0.22em] text-white/70">
            NUMBERS
          </p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Recover and move it same day
          </h2>
        </div>
      </div>
    </div>
  </section>
</template>
