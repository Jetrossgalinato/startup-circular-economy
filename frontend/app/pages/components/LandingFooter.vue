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
  <footer class="bg-white px-4 pb-8 pt-4 text-foreground sm:px-6 sm:pb-10 sm:pt-6">
    <div class="mx-auto max-w-6xl border-t border-neutral-200 pt-10 sm:pt-14">
      <div class="flex flex-col justify-between gap-3 rounded-3xl bg-[#eef3f0] p-6 sm:flex-row sm:items-end sm:p-8">
        <div>
          <p class="text-3xl font-semibold tracking-tight text-foreground">
            E-WISE
          </p>
          <p class="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            Butuan City, Agusan del Norte<br>
            Caraga Region, Philippines
          </p>
        </div>
        <p class="inline-flex w-fit rounded-full bg-white px-3 py-1.5 text-sm font-medium text-foreground">
          English (PH)
        </p>
      </div>

      <div class="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 lg:grid-cols-4">
        <div v-for="column in columns" :key="column.title">
          <h3 class="text-xs font-semibold tracking-[0.18em] text-primary">
            {{ column.title.toUpperCase() }}
          </h3>
          <ul class="mt-4 space-y-2.5">
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

      <div class="mt-10 flex flex-col gap-4 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-neutral-400">
          © E-WISE 2026.
        </p>
        <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/80">
          <a href="#" class="hover:text-foreground">Privacy Policy</a>
          <a href="#" class="hover:text-foreground">Terms of Use</a>
          <a href="#" class="hover:text-foreground">Disclosure</a>
        </div>
      </div>
    </div>
  </footer>
</template>
