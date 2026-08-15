<script setup lang="ts">
import { Plus, X } from '@lucide/vue'

const items = [
  {
    question: 'How do I sell e-waste?',
    answer:
      'List your item on E-WISE, accept the published per-kilo rate for its category, and we arrange pickup. You transact only with the company — not with a collector.',
  },
  {
    question: 'How is the payout calculated?',
    answer:
      'Pricing uses a public rate card by device category and weight — the same method local scrap buyers already use. You can verify the figure on a scale, and we can defend it if a price is ever questioned.',
  },
  {
    question: 'Will collectors contact me directly?',
    answer:
      'No. E-WISE is the sole intermediary. Collectors and B2B buyers only see company inventory. Your identity and contact details stay off their listings.',
  },
  {
    question: 'What happens to hazardous items?',
    answer:
      'Every unit is hazard-checked at intake. Damaged batteries and other high-risk items are diverted to a dedicated path with an accredited partner, not mixed into general resale.',
  },
  {
    question: 'Can I get a device repaired instead?',
    answer:
      'Yes. Repair is a separate marketplace with verified technicians. You book a job on the platform, and ratings only count after a completed, booked repair.',
  },
]

const openIndex = ref(1)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? -1 : index
}
</script>

<template>
  <section id="faq" class="scroll-mt-24 bg-white px-6 pb-16 pt-8 text-foreground">
    <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
      <header>
        <p class="text-xs font-semibold tracking-[0.22em] text-primary">
          FAQ
        </p>
        <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Frequently asked questions
        </h2>
      </header>

      <div class="border-t border-neutral-200">
        <div
          v-for="(item, index) in items"
          :key="item.question"
          class="border-b border-neutral-200"
        >
          <button
            type="button"
            class="flex w-full items-start justify-between gap-6 py-5 text-left"
            :aria-expanded="openIndex === index"
            @click="toggle(index)"
          >
            <span class="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {{ item.question }}
            </span>
            <span class="mt-0.5 shrink-0 text-neutral-400">
              <X v-if="openIndex === index" class="size-5" />
              <Plus v-else class="size-5" />
            </span>
          </button>
          <div v-show="openIndex === index" class="pb-5 pr-12">
            <p class="text-sm leading-7 text-muted-foreground sm:text-base">
              {{ item.answer }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
