<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { getNavItemsForRole, type InsideNavItem } from '@/constants/nav'

export type { InsideNavItem }

const props = withDefaults(defineProps<{
  items?: InsideNavItem[]
}>(), {
  items: undefined,
})

const route = useRoute()
const { profile } = useAuth()

const navItems = computed((): InsideNavItem[] =>
  props.items ?? getNavItemsForRole(profile.value?.role),
)

const { fetchUnreadCount, peekUnreadCount } = useAdminClaims()
const unreadClaims = ref(peekUnreadCount() ?? 0)
const { listingsTick } = useRealtimeTicks()

async function loadUnread() {
  if (profile.value?.role !== 'admin') {
    unreadClaims.value = 0
    return
  }
  try {
    unreadClaims.value = await fetchUnreadCount({ force: true })
  } catch {
    unreadClaims.value = peekUnreadCount() ?? 0
  }
}

onMounted(() => {
  void loadUnread()
})

watch(listingsTick, () => {
  void loadUnread()
})

watch(() => profile.value?.role, () => {
  void loadUnread()
})

function badgeFor(item: InsideNavItem) {
  if (item.badge === 'claims' && unreadClaims.value > 0) {
    return unreadClaims.value > 9 ? '9+' : String(unreadClaims.value)
  }
  return null
}

const trackRef = ref<HTMLElement | null>(null)
const linkRefs = ref<(HTMLElement | null)[]>([])

const indicator = reactive({
  x: 0,
  width: 0,
  ready: false,
})

function isActive(item: InsideNavItem) {
  if (item.match) {
    return item.match(route.path)
  }
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

const activeIndex = computed(() =>
  navItems.value.findIndex((item) => isActive(item)),
)

function setLinkRef(el: Element | ComponentPublicInstance | null, index: number) {
  const node = (el && typeof el === 'object' && '$el' in el
    ? (el.$el as HTMLElement | null)
    : (el as HTMLElement | null))
  linkRefs.value[index] = node
}

function updateIndicator() {
  const index = activeIndex.value
  const track = trackRef.value
  const link = linkRefs.value[index]

  if (!track || !link || index < 0) {
    indicator.ready = false
    return
  }

  const trackBox = track.getBoundingClientRect()
  const linkBox = link.getBoundingClientRect()

  indicator.x = linkBox.left - trackBox.left
  indicator.width = linkBox.width
  indicator.ready = true
}

watch([activeIndex, () => navItems.value.length, () => route.path], async () => {
  await nextTick()
  requestAnimationFrame(updateIndicator)
})

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(updateIndicator)
  window.addEventListener('resize', updateIndicator)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIndicator)
})
</script>

<template>
  <nav
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    aria-label="Primary"
  >
    <div
      ref="trackRef"
      class="pointer-events-auto relative flex w-full max-w-md items-center gap-1 rounded-full border border-neutral-200/80 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md"
    >
      <div
        class="absolute top-1.5 bottom-1.5 left-0 rounded-full bg-foreground shadow-sm will-change-transform"
        :class="indicator.ready
          ? 'opacity-100 transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
          : 'opacity-0'"
        :style="{
          width: `${indicator.width}px`,
          transform: `translate3d(${indicator.x}px, 0, 0)`,
        }"
        aria-hidden="true"
      />

      <NuxtLink
        v-for="(item, index) in navItems"
        :key="item.to"
        :ref="(el) => setLinkRef(el, index)"
        :to="item.to"
        class="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1.5 py-2 text-[10px] font-medium transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:px-2 sm:text-xs"
        :class="isActive(item)
          ? 'text-white'
          : 'text-foreground/55 hover:text-foreground'"
      >
        <span class="relative">
          <component
            :is="item.icon"
            class="size-5 transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            :class="isActive(item) ? 'scale-110' : 'scale-100'"
            :stroke-width="isActive(item) ? 2.25 : 1.75"
          />
          <span
            v-if="badgeFor(item)"
            class="absolute -top-1.5 -right-2 min-w-4 rounded-full px-1 text-center text-[9px] font-bold leading-4"
            :class="isActive(item) ? 'bg-white text-foreground' : 'bg-foreground text-white'"
          >
            {{ badgeFor(item) }}
          </span>
        </span>
        <span
          class="transition-[transform,opacity,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        >
          {{ item.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
