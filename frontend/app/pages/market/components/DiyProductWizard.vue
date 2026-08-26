<script setup lang="ts">
import { toast } from 'vue-sonner'
import { AUTH_INPUT_CLASS } from '@/constants/auth'
import { DIY_CATEGORIES, DIY_MAX_PHOTOS } from '@/constants/diy'
import type { DiyCategory, DiyProduct, DiyProductPhoto } from '@/types/diy'

const props = defineProps<{
  product?: DiyProduct | null
}>()

const emit = defineEmits<{
  submitted: [product: DiyProduct]
}>()

const steps = ['photos', 'details', 'pricing'] as const
const stepIndex = ref(0)
const step = computed(() => steps[stepIndex.value])

const { profile } = useAuth()
const { createDraft, updateProduct, submitProduct } = useDiyProducts()
const { uploadPhotos, getSignedUrls, removePhoto } = useDiyUpload()

const productId = ref(props.product?.id ?? null)
const files = ref<File[]>([])
const previews = ref<string[]>([])
const savedPhotos = ref<DiyProductPhoto[]>(props.product?.diy_product_photos ?? [])
const existingCount = computed(() => savedPhotos.value.length)
const savedPhotoItems = computed(() =>
  savedPhotos.value
    .filter((photo) => photo.signed_url)
    .map((photo) => ({ id: photo.id, url: photo.signed_url as string })),
)

watch(
  () => props.product,
  (next) => {
    if (!next) return
    productId.value = next.id
    savedPhotos.value = next.diy_product_photos ?? []
  },
)

const title = ref(props.product?.title ?? '')
const description = ref(props.product?.description ?? '')
const category = ref<DiyCategory>(props.product?.category ?? 'home_decor')
const ewasteSource = ref(props.product?.ewaste_source ?? '')
const price = ref(props.product?.price ? String(props.product.price) : '')
const stock = ref(props.product?.stock ? String(props.product.stock) : '1')
const saving = ref(false)

onBeforeUnmount(() => {
  previews.value.forEach((url) => URL.revokeObjectURL(url))
})

function addFiles(next: File[]) {
  const room = Math.max(0, DIY_MAX_PHOTOS - files.value.length - existingCount.value)
  const incoming = next.slice(0, room)
  files.value = [...files.value, ...incoming]
  previews.value = [...previews.value, ...incoming.map((file) => URL.createObjectURL(file))]
}

function removeFile(index: number) {
  const preview = previews.value.at(index)
  if (preview) URL.revokeObjectURL(preview)
  files.value = files.value.filter((_, i) => i !== index)
  previews.value = previews.value.filter((_, i) => i !== index)
}

async function removeSavedPhoto(index: number) {
  const item = savedPhotoItems.value[index]
  const photo = savedPhotos.value.find((entry) => entry.id === item?.id)
  if (!photo) return
  try {
    await removePhoto(photo)
    savedPhotos.value = savedPhotos.value.filter((entry) => entry.id !== photo.id)
  } catch (error) {
    toast.error('Could not remove photo', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  }
}

function clearLocalPhotos() {
  files.value = []
  previews.value.forEach((url) => URL.revokeObjectURL(url))
  previews.value = []
}

async function attachNewPhotos(id: string) {
  if (files.value.length === 0) return
  const uploaded = await uploadPhotos(id, files.value)
  const withUrls = await getSignedUrls(uploaded)
  savedPhotos.value = [...savedPhotos.value, ...withUrls]
  clearLocalPhotos()
}

const canContinue = computed(() => {
  if (step.value === 'photos') return files.value.length + existingCount.value > 0
  if (step.value === 'details') {
    return title.value.trim().length >= 3
      && description.value.trim().length >= 8
      && ewasteSource.value.trim().length >= 8
  }
  const parsedPrice = Number(price.value)
  const parsedStock = Number(stock.value)
  return Number.isFinite(parsedPrice) && parsedPrice > 0 && Number.isInteger(parsedStock) && parsedStock >= 1
})

const missingProfile = computed(() => {
  return !profile.value?.default_gcash_number?.trim()
    || !profile.value?.phone?.trim()
    || !profile.value?.address?.trim()
})

async function persistDraft() {
  const payload = {
    title: title.value.trim() || 'Untitled piece',
    description: description.value.trim(),
    category: category.value,
    ewaste_source: ewasteSource.value.trim(),
    price: Number(price.value) > 0 ? Number(price.value) : 1,
    stock: Number(stock.value) >= 1 ? Number.parseInt(stock.value, 10) : 1,
  }

  if (!productId.value) {
    const created = await createDraft(payload)
    productId.value = created.id
    await attachNewPhotos(created.id)
    return created
  }

  const updated = await updateProduct(productId.value, payload)
  await attachNewPhotos(productId.value)
  return updated
}

async function goNext() {
  if (!canContinue.value || saving.value) return
  saving.value = true
  try {
    if (step.value === 'photos' && files.value.length) {
      await persistDraft()
    }
    if (step.value === 'pricing') {
      if (missingProfile.value) {
        toast.error('Complete your profile first', {
          description: 'Add GCash, phone, and address so residents can pay and pick up.',
        })
        return
      }
      await persistDraft()
      if (!productId.value) return
      const submitted = await submitProduct(productId.value)
      toast.success('Submitted for review')
      emit('submitted', submitted)
      return
    }
    stepIndex.value += 1
  } catch (error) {
    toast.error('Could not save', {
      description: error instanceof Error ? error.message : 'Try again.',
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between gap-3">
      <p class="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Step {{ stepIndex + 1 }} / {{ steps.length }}
      </p>
      <div class="flex gap-1">
        <span
          v-for="(s, i) in steps"
          :key="s"
          class="h-1 w-6 rounded-full"
          :class="i <= stepIndex ? 'bg-foreground' : 'bg-neutral-200'"
        />
      </div>
    </div>

    <SellPhotoStep
      v-if="step === 'photos'"
      :files="files"
      :previews="previews"
      :saved-photos="savedPhotoItems"
      heading="Show the finished piece"
      hint="At least one photo of the upcycled product. Made from e-waste only."
      @add="addFiles"
      @remove="removeFile"
      @remove-saved="removeSavedPhoto"
    />

    <div v-else-if="step === 'details'" class="space-y-4">
      <h2 class="text-xl font-bold tracking-tight">
        What did you <span class="font-serif font-medium italic">make</span>
      </h2>
      <div class="flex flex-col gap-1.5">
        <Label for="diy-title">Title</Label>
        <Input id="diy-title" v-model="title" :class="AUTH_INPUT_CLASS" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="diy-desc">Description</Label>
        <textarea id="diy-desc" v-model="description" rows="4" class="min-h-24 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>Category</Label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in DIY_CATEGORIES"
            :key="option.value"
            type="button"
            class="rounded-full border px-3 py-1.5 text-xs font-medium"
            :class="category === option.value ? 'border-foreground bg-foreground text-white' : 'border-neutral-200'"
            @click="category = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="diy-source">E-waste this was made from</Label>
        <textarea
          id="diy-source"
          v-model="ewasteSource"
          rows="3"
          class="min-h-20 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          placeholder="e.g. Monitor housings and laptop keyboard keys"
        />
      </div>
    </div>

    <div v-else class="space-y-4">
      <h2 class="text-xl font-bold tracking-tight">
        Price and <span class="font-serif font-medium italic">stock</span>
      </h2>
      <div class="flex flex-col gap-1.5">
        <Label for="diy-price">Price (₱)</Label>
        <Input id="diy-price" v-model="price" type="number" min="1" step="0.01" :class="AUTH_INPUT_CLASS" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="diy-stock">Stock</Label>
        <Input id="diy-stock" v-model="stock" type="number" min="1" step="1" :class="AUTH_INPUT_CLASS" />
      </div>
      <p v-if="missingProfile" class="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
        Add GCash, phone, and address on your
        <NuxtLink to="/collector/profile" class="font-medium underline underline-offset-2">profile</NuxtLink>
        before submitting.
      </p>
      <p class="text-sm text-muted-foreground">An admin reviews every listing before it goes live.</p>
    </div>

    <div class="mt-8 flex gap-2">
      <Button
        v-if="stepIndex > 0"
        type="button"
        variant="outline"
        class="h-11 flex-1 rounded-full"
        :disabled="saving"
        @click="stepIndex -= 1"
      >
        Back
      </Button>
      <Button
        type="button"
        class="h-11 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
        :disabled="saving || !canContinue"
        @click="goNext"
      >
        <template v-if="saving">Saving…</template>
        <template v-else-if="step === 'pricing'">Submit for review</template>
        <template v-else>Continue</template>
      </Button>
    </div>
  </div>
</template>
