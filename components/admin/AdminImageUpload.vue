<script setup lang="ts">
const props = defineProps<{
  modelValue?: string | null
  label: string
  folder?: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const { upload, remove, uploading, progress, error } = useStorageUpload('product-images')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Background removal state
const isRemovingBg = ref(false)
const bgStatusText = ref('')
const bgError = ref<string | null>(null)

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    await processAndUpload(input.files[0])
  }
}

async function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    await processAndUpload(event.dataTransfer.files[0])
  }
}

/**
 * Core pipeline: file selected → remove background → upload transparent PNG
 * Background removal runs FIRST, before any Supabase upload.
 */
async function processAndUpload(file: File) {
  bgError.value = null
  isRemovingBg.value = true
  bgStatusText.value = 'Preparing AI engine...'

  try {
    // --- Step 1: Remove background locally using AI ---
    bgStatusText.value = 'Loading AI model (1st run downloads ~30MB assets)...'

    // Dynamic import for SSR safety
    const imglyModule: any = await import('@imgly/background-removal')
    const imglyRemoveBackground = typeof imglyModule.removeBackground === 'function'
      ? imglyModule.removeBackground
      : (typeof imglyModule.default === 'function' ? imglyModule.default : imglyModule.default?.default)

    if (typeof imglyRemoveBackground !== 'function') {
      throw new Error('Failed to resolve removeBackground function from @imgly/background-removal')
    }

    const resultBlob = await imglyRemoveBackground(file, {
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const pct = Math.round((current / total) * 100)
          bgStatusText.value = `Downloading AI assets (${pct}%)...`
        } else if (key.includes('fetch')) {
          bgStatusText.value = 'Fetching model parameters...'
        } else {
          bgStatusText.value = 'Removing background with AI...'
        }
      }
    })

    // --- Step 2: Convert to File and upload the transparent result ---
    bgStatusText.value = 'Uploading transparent PNG...'
    isRemovingBg.value = false // hide BG spinner, let upload spinner take over

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
    const transparentFile = new File([resultBlob], `${nameWithoutExt}_nobg.png`, {
      type: 'image/png'
    })

    const url = await upload(transparentFile, props.folder || 'products')
    if (url) {
      emit('update:modelValue', url)
    }
  } catch (err: any) {
    console.error('Background removal failed:', err)
    bgError.value = err.message || 'Background removal failed'
    isRemovingBg.value = false

    // Fallback: upload the original file if BG removal fails
    bgError.value += ' — Uploading original image as fallback.'
    const url = await upload(file, props.folder || 'products')
    if (url) {
      emit('update:modelValue', url)
    }
  }
}

async function handleRemove() {
  if (props.modelValue && props.modelValue.startsWith('http')) {
    await remove(props.modelValue)
  }
  bgError.value = null
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold">
        {{ label }}
        <span v-if="required" class="text-rose-400">*</span>
      </label>
      <span v-if="modelValue" class="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        BG Removed & Uploaded
      </span>
    </div>

    <!-- Upload area / Dropzone -->
    <div
      class="relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 text-center overflow-hidden"
      :class="[
        isDragging ? 'border-[#e5e7eb] bg-[#e5e7eb]/10' : 'border-[#323245] bg-[#16161e] hover:border-[#4a4a60]',
        uploading || isRemovingBg ? 'pointer-events-none opacity-90' : 'cursor-pointer'
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- If image exists (transparent preview on checkerboard) -->
      <div v-if="modelValue && !isRemovingBg && !uploading" class="relative group aspect-square w-full max-w-[200px] mx-auto overflow-hidden rounded-lg p-2 flex items-center justify-center border border-[#272736]" style="background-image: repeating-conic-gradient(#222230 0% 25%, #14141c 0% 50%); background-size: 16px 16px;">
        <img :src="modelValue" :alt="label" class="w-full h-full object-contain rounded" />
        
        <!-- Overlay on hover -->
        <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
          <button
            type="button"
            class="w-full max-w-[140px] px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-medium rounded-md shadow flex items-center justify-center gap-1.5 transition-colors"
            @click.stop="handleRemove"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
          <span class="text-[10px] text-slate-300">Click box to replace</span>
        </div>
      </div>

      <!-- Upload prompt if no image -->
      <div v-else-if="!uploading && !isRemovingBg" class="py-6 flex flex-col items-center justify-center gap-2">
        <div class="w-10 h-10 rounded-full bg-[#242436] flex items-center justify-center text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="text-xs text-slate-300">
          <span class="font-semibold text-[#e5e7eb]">Click to upload</span> or drag & drop
        </div>
        <p class="text-[10px] text-slate-400">Auto BG removal · PNG, JPG, WEBP, GIF up to 5MB</p>
      </div>

      <!-- Background Removal Processing State -->
      <div v-if="isRemovingBg" class="py-8 flex flex-col items-center justify-center gap-3">
        <div class="relative w-10 h-10 flex items-center justify-center">
          <svg class="animate-spin w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <span class="text-xs text-indigo-300 font-mono text-center px-2">{{ bgStatusText }}</span>
        <span class="text-[10px] text-slate-400">Local browser AI · auto background removal</span>
      </div>

      <!-- Standard Uploading State (after BG removal completes) -->
      <div v-else-if="uploading" class="py-6 flex flex-col items-center justify-center gap-3">
        <div class="w-full max-w-[160px] bg-[#272736] rounded-full h-2 overflow-hidden">
          <div class="bg-[#e5e7eb] h-full transition-all duration-300 rounded-full" :style="{ width: `${progress}%` }" />
        </div>
        <span class="text-xs text-slate-300 font-mono">Uploading transparent PNG... {{ progress }}%</span>
      </div>
    </div>

    <!-- Info bar below preview -->
    <div v-if="modelValue && !isRemovingBg && !uploading" class="flex items-center justify-between px-1">
      <span class="text-[10px] text-slate-500 flex items-center gap-1">
        <svg class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Background auto-removed
      </span>
      <span class="text-[10px] text-slate-500">Checkerboard = transparent</span>
    </div>

    <!-- Error messages -->
    <p v-if="error" class="text-xs text-rose-400 font-mono">{{ error }}</p>
    <p v-if="bgError" class="text-xs text-rose-400 font-mono">{{ bgError }}</p>
  </div>
</template>


