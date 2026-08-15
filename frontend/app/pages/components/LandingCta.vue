<script setup lang="ts">
import { Sparkle } from '@lucide/vue'
import { Button } from '@/components/ui/button'
</script>

<template>
  <section class="bg-white px-6 pb-48">
    <div class="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-foreground px-8 py-12 text-white sm:px-10 lg:pr-72">
      <div class="pointer-events-none absolute top-7 right-10 hidden gap-2 sm:flex">
        <Sparkle class="size-6 fill-white text-white" />
        <Sparkle class="mt-3 size-4 fill-white text-white" />
      </div>

      <div class="relative z-10 max-w-xl">
        <h2 class="text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
          Change the way you handle your
          <span class="font-serif font-medium italic">e-waste</span>
        </h2>
        <p class="mt-4 text-base leading-7 text-white/75 sm:text-lg">
          Join residents in Butuan City who sell, repair, and upcycle through one platform —
          with a published per-kilo rate and same-day cross-dock.
        </p>
        <Button
          as="a"
          href="#"
          size="lg"
          class="mt-6 h-12 rounded-full bg-white px-7 text-base text-foreground hover:bg-white/90"
        >
          Get Started Now
        </Button>
      </div>

      <div class="pointer-events-none absolute right-0 bottom-0 hidden h-44 w-56 overflow-hidden rounded-tl-[2.5rem] bg-[#f4f1ea] lg:block">
        <svg viewBox="0 0 256 192" class="size-full" aria-hidden="true">
          <rect width="256" height="192" fill="#f4f1ea" />
          <ellipse cx="168" cy="150" rx="42" ry="42" fill="#c9a227" />
          <ellipse cx="168" cy="150" rx="28" ry="28" fill="#e0c35a" />
          <text x="168" y="156" text-anchor="middle" font-size="18" font-weight="700" fill="#6b5310">₱</text>
          <ellipse cx="210" cy="138" rx="34" ry="34" fill="#b8922a" />
          <ellipse cx="210" cy="138" rx="22" ry="22" fill="#d4b44a" />
          <rect x="24" y="48" width="132" height="78" rx="6" fill="#1a3d36" />
          <rect x="32" y="56" width="116" height="46" fill="#e8f3ef" />
          <rect x="40" y="64" width="40" height="8" rx="2" fill="#2d6a5a" />
          <rect x="40" y="78" width="70" height="6" rx="2" fill="#9bb8af" />
          <text x="40" y="108" font-size="14" font-weight="700" fill="#e8f3ef">12.4 kg</text>
        </svg>
      </div>
    </div>
  </section>
</template>
