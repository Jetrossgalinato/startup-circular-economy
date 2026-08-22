<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { RateCardCategory } from '@/types/listings'
import { AUTH_INPUT_CLASS } from '@/constants/auth'
import { formatRatePerKg } from '@/utils/listings/format'

const { fetchAllCategories, updateCategory } = useRateCard()

const categories = ref<RateCardCategory[]>([])
const drafts = ref<Record<string, string>>({})
const loading = ref(true)
const savingCode = ref<string | null>(null)

onMounted(async () => {
  try {
    const rows = await fetchAllCategories()
    categories.value = rows
    drafts.value = Object.fromEntries(
      rows.map((row) => [row.code, String(row.rate_per_kg)]),
    )
  } catch (error) {
    toast.error('Could not load rate card', {
      description: error instanceof Error ? error.message : 'Try again later.',
    })
  } finally {
    loading.value = false
  }
})

function isDirty(category: RateCardCategory) {
  const next = Number(drafts.value[category.code])
  return Number.isFinite(next) && next !== category.rate_per_kg
}

async function save(category: RateCardCategory) {
  const next = Number(drafts.value[category.code])
  if (!Number.isFinite(next) || next < 0) {
    toast.error('Invalid rate', {
      description: 'Enter a ₱/kg amount of 0 or more.',
    })
    return
  }

  savingCode.value = category.code
  try {
    const updated = await updateCategory(category.code, { rate_per_kg: next })
    categories.value = categories.value.map((row) =>
      row.code === updated.code ? updated : row,
    )
    drafts.value[category.code] = String(updated.rate_per_kg)
    toast.success('Rate updated', {
      description: `${updated.name} is now ${formatRatePerKg(updated.rate_per_kg)}.`,
    })
  } catch (error) {
    toast.error('Could not save rate', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    savingCode.value = null
  }
}
</script>

<template>
  <div class="space-y-3">
    <p v-if="loading" class="text-sm text-muted-foreground">
      Loading rates…
    </p>
    <div
      v-for="category in categories"
      :key="category.code"
      class="rounded-2xl border border-neutral-200 p-4"
    >
      <p class="text-sm font-semibold">
        {{ category.code }} · {{ category.name }}
      </p>
      <p class="mt-0.5 text-xs text-muted-foreground">
        {{ category.examples }}
      </p>
      <div class="mt-3 flex items-end gap-2">
        <div class="min-w-0 flex-1">
          <Label :for="`rate-${category.code}`">₱ / kg</Label>
          <Input
            :id="`rate-${category.code}`"
            v-model="drafts[category.code]"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            :class="AUTH_INPUT_CLASS"
          />
        </div>
        <Button
          type="button"
          class="h-10 rounded-full bg-foreground px-5 text-white hover:bg-foreground/90 disabled:opacity-50"
          :disabled="!isDirty(category) || savingCode === category.code"
          @click="save(category)"
        >
          {{ savingCode === category.code ? 'Saving…' : 'Save' }}
        </Button>
      </div>
    </div>
  </div>
</template>
