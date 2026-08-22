<script setup lang="ts">
import type { HazardTier } from '@/types/listings'
import loadingClip from '~/assets/videos/loading.mp4'

const props = defineProps<{
  tier: HazardTier
  reasons: string[]
  loading?: boolean
}>()

const tierCopy: Record<HazardTier, { title: string; body: string; tone: string }> = {
  1: {
    title: 'Tier 1 — Standard',
    body: 'Safe for standard pickup. Item will be weighed, tagged, and moved same-day through our cross-dock.',
    tone: 'bg-[#dce8ee] text-foreground',
  },
  2: {
    title: 'Tier 2 — Caution',
    body: 'Needs careful handling. Segregated staging and trained staff — still eligible for pickup.',
    tone: 'bg-[#ead9c4] text-foreground',
  },
  3: {
    title: 'Tier 3 — Hazardous',
    body: 'Routed to our hazardous track (TSD path). You can still be paid a fair per-kilo rate after weigh-in; it will not enter general resale inventory.',
    tone: 'bg-amber-100 text-amber-950',
  },
  4: {
    title: 'Tier 4 — Intake refused',
    body: 'We cannot safely pick this up. Call DENR-EMB Caraga (Butuan) or the DENR citizen hotline for TSD disposal guidance.',
    tone: 'bg-red-100 text-red-950',
  },
}

const copy = computed(() => tierCopy[props.tier])

const STATUS_MESSAGES = [
  'Checking photos and condition…',
  'Looking for batteries, leaks, and damage…',
  'Running safety classification…',
  'Routing the right handling track…',
] as const

const progress = ref(8)
const showResult = ref(!props.loading)
const statusIndex = ref(0)
let rampTimer: ReturnType<typeof setInterval> | null = null
let statusTimer: ReturnType<typeof setInterval> | null = null
let completeTimer: ReturnType<typeof setTimeout> | null = null

function stopRamp() {
  if (rampTimer) {
    clearInterval(rampTimer)
    rampTimer = null
  }
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
}

function startRamp() {
  stopRamp()
  progress.value = 8
  statusIndex.value = 0
  showResult.value = false
  rampTimer = setInterval(() => {
    if (progress.value >= 90) {
      return
    }
    progress.value = Math.min(90, progress.value + Math.max(5, (90 - progress.value) * 0.22))
  }, 40)
  statusTimer = setInterval(() => {
    statusIndex.value = (statusIndex.value + 1) % STATUS_MESSAGES.length
  }, 1400)
}

watch(
  () => props.loading,
  (loading) => {
    if (completeTimer) {
      clearTimeout(completeTimer)
      completeTimer = null
    }

    if (import.meta.server) {
      showResult.value = !loading
      return
    }

    if (loading) {
      startRamp()
      return
    }

    stopRamp()
    progress.value = 100
    completeTimer = setTimeout(() => {
      showResult.value = true
    }, 80)
  },
  { immediate: true },
)

onUnmounted(() => {
  stopRamp()
  if (completeTimer) {
    clearTimeout(completeTimer)
  }
})
</script>

<template>
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">
      Hazard
      <span class="font-serif font-medium italic">triage</span>
    </h2>
    <p class="mt-1.5 text-sm text-muted-foreground">
      Our first job is safety — not guessing resale value.
    </p>

    <div v-if="!showResult" class="mt-8 py-6">
      <video
        :src="loadingClip"
        class="mx-auto mb-4 h-28 w-auto object-contain sm:h-32"
        autoplay
        loop
        muted
        playsinline
        aria-hidden="true"
      />
      <div
        class="h-2 w-full overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
        :aria-valuenow="Math.round(progress)"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Safety classification"
      >
        <div
          class="h-full rounded-full bg-foreground transition-[width] duration-150 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="mt-3 text-sm text-muted-foreground">
        {{ STATUS_MESSAGES[statusIndex] }}
      </p>
    </div>

    <div v-else class="mt-5 space-y-4">
      <div class="rounded-[1.5rem] p-5" :class="copy.tone">
        <p class="text-[10px] font-semibold tracking-[0.16em] uppercase opacity-60">
          Result
        </p>
        <p class="mt-1 text-xl font-bold tracking-tight">
          {{ copy.title }}
        </p>
        <p class="mt-2 text-sm leading-6 opacity-90">
          {{ copy.body }}
        </p>
      </div>

      <ul v-if="reasons.length" class="space-y-2">
        <li
          v-for="reason in reasons"
          :key="reason"
          class="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-foreground/80"
        >
          {{ reason }}
        </li>
      </ul>

      <div
        v-if="tier === 4"
        class="rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <p class="text-sm font-semibold">Call for disposal</p>
        <p class="mt-1 text-xs text-muted-foreground">
          EMB Caraga — Butuan City (pilot)
        </p>
        <a
          href="tel:+63853413826"
          class="mt-2 block text-lg font-bold tracking-tight text-foreground underline underline-offset-2"
        >
          (085) 341-3826
        </a>
        <p class="mt-3 text-xs text-muted-foreground">DENR citizen hotline</p>
        <a
          href="tel:8888"
          class="mt-0.5 block text-lg font-bold tracking-tight text-foreground underline underline-offset-2"
        >
          8888
        </a>
      </div>
    </div>
  </div>
</template>
