<script setup lang="ts">
const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Sell e-waste', href: '#sell-e-waste' },
      { label: 'Repair', href: '#repair' },
      { label: 'Upcycle', href: '#' },
      { label: 'Rate card', href: '#' },
      { label: 'Peer exchange', href: '#' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Community', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Operations',
    links: [
      { label: 'Cross-dock', href: '#company' },
      { label: 'Hazard check', href: '#how-it-works' },
      { label: 'Pickups', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#company' },
      { label: 'Contact', href: '#' },
      { label: 'Sustainability', href: '#' },
      { label: 'Career', href: '#' },
    ],
  },
]
</script>

<template>
  <footer class="bg-white px-6 pb-10 pt-6 text-foreground">
    <div class="mx-auto max-w-6xl">
      <div class="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div class="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
          <div v-for="column in columns" :key="column.title">
            <h3 class="text-sm font-semibold">
              {{ column.title }}
            </h3>
            <ul class="mt-4 space-y-3">
              <li v-for="link in column.links" :key="link.label">
                <a
                  :href="link.href"
                  class="text-sm text-foreground/80 transition-colors hover:text-foreground"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="lg:max-w-xs lg:text-right">
          <p class="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            E-WISE
          </p>
          <p class="mt-4 text-sm leading-6 text-muted-foreground">
            Butuan City, Agusan del Norte<br>
            Caraga Region, Philippines
          </p>
          <p class="mt-6 text-sm text-foreground/80">
            English (PH)
          </p>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-neutral-400">
          © E-WISE 2026.
        </p>
        <div class="flex flex-wrap gap-6 text-sm text-foreground/80">
          <a href="#" class="hover:text-foreground">Privacy Policy</a>
          <a href="#" class="hover:text-foreground">Terms of Use</a>
          <a href="#" class="hover:text-foreground">Disclosure</a>
        </div>
      </div>
    </div>
  </footer>
</template>
