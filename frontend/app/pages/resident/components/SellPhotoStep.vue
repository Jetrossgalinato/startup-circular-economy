<script setup lang="ts">
import { Camera, ImagePlus, Images, X } from '@lucide/vue'
import { toast } from 'vue-sonner'

const props = withDefaults(defineProps<{
  files: File[]
  previews: string[]
  heading?: string
  hint?: string
  savedPhotos?: { id: string, url: string }[]
}>(), {
  heading: 'Add clear photos',
  hint: 'Include the whole device, any damage, and the battery compartment if visible.',
  savedPhotos: () => [],
})

const emit = defineEmits<{
  add: [files: File[]]
  remove: [index: number]
  'remove-saved': [index: number]
}>()

const hasPhotos = computed(() => props.files.length > 0 || props.savedPhotos.length > 0)

const sheetOpen = ref(false)
const cameraOpen = ref(false)
const cameraReady = ref(false)
const cameraError = ref('')
const galleryInputRef = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

let stream: MediaStream | null = null

function closeSheet() {
  sheetOpen.value = false
}

function stopStream() {
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

function closeCamera() {
  stopStream()
  cameraReady.value = false
  cameraError.value = ''
  cameraOpen.value = false
}

async function requestStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera is not supported in this browser.')
  }
  if (!window.isSecureContext) {
    throw new Error('Camera needs HTTPS or localhost.')
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
  } catch {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
  }
}

async function startWebcam() {
  cameraError.value = ''
  cameraReady.value = false
  stopStream()
  stream = await requestStream()
  await nextTick()
  const video = videoRef.value
  if (!video) {
    throw new Error('Camera preview is not ready.')
  }
  video.srcObject = stream
  await video.play()
  cameraReady.value = true
}

async function openCamera() {
  closeSheet()
  cameraOpen.value = true
  cameraError.value = ''
  cameraReady.value = false
  await nextTick()
  try {
    await startWebcam()
  } catch (error) {
    cameraReady.value = false
    cameraError.value = error instanceof Error
      ? error.message
      : 'Allow camera access in the browser, then try again.'
    toast.error('Could not open camera', {
      description: cameraError.value,
    })
  }
}

function capturePhoto() {
  const video = videoRef.value
  if (!video || !video.videoWidth) {
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  context.drawImage(video, 0, 0)
  canvas.toBlob((blob) => {
    if (!blob) {
      toast.error('Could not capture photo', {
        description: 'Try again, or choose from gallery.',
      })
      return
    }
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
    emit('add', [file])
    closeCamera()
  }, 'image/jpeg', 0.92)
}

function openGallery() {
  galleryInputRef.value?.click()
  closeSheet()
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files ?? [])
  if (selected.length) {
    emit('add', selected)
  }
  input.value = ''
}

onBeforeUnmount(() => {
  closeCamera()
})
</script>

<template>
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">
      {{ props.heading }}
    </h2>
    <p class="mt-1.5 text-sm text-muted-foreground">
      {{ props.hint }}
    </p>

    <div class="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
      <button
        type="button"
        class="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-foreground/60 transition hover:border-foreground/40 hover:bg-neutral-100"
        @click="sheetOpen = true"
      >
        <ImagePlus class="size-6" />
        <span class="text-[10px] font-medium sm:text-xs">Add</span>
      </button>

      <div
        v-for="(photo, index) in props.savedPhotos"
        :key="photo.id"
        class="relative aspect-square overflow-hidden rounded-2xl bg-neutral-200"
      >
        <img :src="photo.url" alt="" class="size-full object-cover">
        <button
          type="button"
          class="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-foreground/80 text-white"
          aria-label="Remove saved photo"
          @click="emit('remove-saved', index)"
        >
          <X class="size-3.5" />
        </button>
      </div>

      <div
        v-for="(preview, index) in props.previews"
        :key="`${preview}-${index}`"
        class="relative aspect-square overflow-hidden rounded-2xl bg-neutral-200"
      >
        <img :src="preview" alt="" class="size-full object-cover">
        <button
          type="button"
          class="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-foreground/80 text-white"
          aria-label="Remove photo"
          @click="emit('remove', index)"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </div>

    <input
      ref="galleryInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onPick"
    >

    <p v-if="!hasPhotos" class="mt-3 text-xs text-muted-foreground">
      At least one photo is required.
    </p>

    <Teleport to="body">
      <div
        v-if="sheetOpen"
        class="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
        @click.self="closeSheet"
      >
        <div
          class="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Add photo"
        >
          <h3 class="text-lg font-bold tracking-tight">
            Add a photo
          </h3>
          <p class="mt-1 text-sm text-muted-foreground">
            Take a new shot or pick from your gallery.
          </p>
          <div class="mt-4 space-y-2">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-left text-sm font-medium hover:border-neutral-300"
              @click="openCamera"
            >
              <Camera class="size-5 shrink-0" />
              Take photo
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-left text-sm font-medium hover:border-neutral-300"
              @click="openGallery"
            >
              <Images class="size-5 shrink-0" />
              Choose from gallery
            </button>
            <Button
              type="button"
              variant="outline"
              class="mt-1 h-11 w-full rounded-full border-neutral-200"
              @click="closeSheet"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div
        v-if="cameraOpen"
        class="fixed inset-0 z-[70] flex items-end justify-center bg-foreground/50 p-4 sm:items-center"
      >
        <div
          class="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Camera"
        >
          <div class="overflow-hidden rounded-2xl bg-neutral-900">
            <video
              ref="videoRef"
              class="aspect-[3/4] w-full bg-neutral-900 object-cover"
              autoplay
              playsinline
              muted
            />
          </div>
          <p v-if="cameraError" class="mt-3 text-sm text-red-700">
            {{ cameraError }}
          </p>
          <p v-else-if="!cameraReady" class="mt-3 text-sm text-muted-foreground">
            Starting camera… Allow access if the browser asks.
          </p>
          <div class="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              class="h-11 flex-1 rounded-full border-neutral-200"
              @click="closeCamera"
            >
              Cancel
            </Button>
            <Button
              v-if="cameraError"
              type="button"
              class="h-11 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
              @click="openCamera"
            >
              Try again
            </Button>
            <Button
              v-else
              type="button"
              class="h-11 flex-1 rounded-full bg-foreground text-white hover:bg-foreground/90"
              :disabled="!cameraReady"
              @click="capturePhoto"
            >
              Capture
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
