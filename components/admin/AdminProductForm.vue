<script setup lang="ts">
import AdminImageUpload from '~/components/admin/AdminImageUpload.vue'
import AdminGradientPicker from '~/components/admin/AdminGradientPicker.vue'

const props = defineProps<{
  initialData?: any
  isEditing?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: any): void
  (e: 'cancel'): void
}>()

const form = reactive({
  title: props.initialData?.title || '',
  handle: props.initialData?.handle || '',
  category: props.initialData?.category || 'fragrance',
  description: props.initialData?.description || '',
  image_url: props.initialData?.image_url || props.initialData?.image || '',
  image_2_url: props.initialData?.image_2_url || props.initialData?.image2 || '',
  image_3_url: props.initialData?.image_3_url || props.initialData?.image3 || '',
  gradient: props.initialData?.gradient || 'linear-gradient(135deg, #f5f0e8 0%, #ebe4d8 100%)',
  badge: props.initialData?.badge || '',
  sort_order: props.initialData?.sort_order ?? 0,
  variants: props.initialData?.variants?.length
    ? props.initialData.variants.map((v: any) => ({
        title: v.title || '50ml',
        option_label: v.option_label || v.option || v.title || '50ml',
        sku: v.sku || '',
        price: v.price || 92
      }))
    : [
        { title: '50ml', option_label: '50ml', sku: '', price: 92 },
        { title: '100ml', option_label: '100ml', sku: '', price: 150 }
      ],
  notes: props.initialData?.notes?.length
    ? [...props.initialData.notes]
    : [''],
  gender: props.initialData?.gender?.length
    ? [...props.initialData.gender]
    : ['unisex']
})

// Auto-slugify handle from title if creating new product
watch(
  () => form.title,
  (newTitle) => {
    if (!props.isEditing) {
      form.handle = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
  }
)

function addVariant() {
  form.variants.push({ title: '100ml', option_label: '100ml', sku: '', price: 150 })
}

function removeVariant(index: number) {
  if (form.variants.length > 1) {
    form.variants.splice(index, 1)
  }
}

function addNote() {
  form.notes.push('')
}

function removeNote(index: number) {
  form.notes.splice(index, 1)
}

function toggleGender(val: string) {
  const idx = form.gender.indexOf(val)
  if (idx === -1) {
    form.gender.push(val)
  } else {
    form.gender.splice(idx, 1)
  }
}

const isSubmitting = ref(false)

function handleSubmit() {
  if (!form.title || !form.handle || !form.image_url) {
    alert('Please fill in required fields (Title, Handle, Primary Image)')
    return
  }

  isSubmitting.value = true
  // Clean empty notes
  const cleanNotes = form.notes.filter((n) => n.trim().length > 0)

  emit('save', {
    ...form,
    notes: cleanNotes
  })
}
</script>

<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <!-- Top Action Bar -->
    <div class="flex items-center justify-between border-b border-[#272736] pb-6">
      <div>
        <h2 class="text-xl font-semibold text-slate-100">
          {{ isEditing ? `Edit: ${initialData?.title}` : 'Create New Product' }}
        </h2>
        <p class="text-xs text-slate-400">Fill in product details, upload high-res images, configure variants</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-4 py-2 bg-[#20202d] hover:bg-[#28283a] text-slate-300 text-xs font-medium rounded-lg transition-colors border border-[#323245]"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-5 py-2 bg-[#e5e7eb] hover:bg-[#d4b58a] text-ink font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          :disabled="isSubmitting"
        >
          <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{{ isEditing ? 'Update Product' : 'Create Product' }}</span>
        </button>
      </div>
    </div>

    <!-- 2 Column Layout for Form Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Core info & Images (2 cols wide) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info Card -->
        <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-5">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">General Details</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Title <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="e.g. Sublimity"
                class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Handle / Slug <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="form.handle"
                type="text"
                required
                placeholder="e.g. sublimity"
                class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Category <span class="text-rose-400">*</span>
              </label>
              <select
                v-model="form.category"
                class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              >
                <option value="fragrance">Fragrance</option>
                <option value="object">Object</option>
                <option value="set">Set</option>
              </select>
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Badge (Optional)
              </label>
              <input
                v-model="form.badge"
                type="text"
                placeholder="e.g. Top Seller, New"
                class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Sort Order
              </label>
              <input
                v-model.number="form.sort_order"
                type="number"
                class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Product description story..."
              class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
            />
          </div>
        </div>

        <!-- Product Image Uploads Card (Up to 3 images) -->
        <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">
              Product Images (Up to 3)
            </h3>
            <span class="text-xs text-slate-400">Supported: PNG, JPG, WEBP, GIF (Max 5MB)</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminImageUpload
              v-model="form.image_url"
              label="Primary Image"
              folder="products"
              :required="true"
            />
            <AdminImageUpload
              v-model="form.image_2_url"
              label="Second Image (PDP)"
              folder="products"
            />
            <AdminImageUpload
              v-model="form.image_3_url"
              label="Third Image (PDP)"
              folder="products"
            />
          </div>
        </div>

        <!-- Product Variants Card -->
        <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">
              Variants (Sizes / Options & Prices)
            </h3>
            <button
              type="button"
              class="text-xs text-[#e5e7eb] hover:underline font-medium flex items-center gap-1"
              @click="addVariant"
            >
              + Add Variant
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(variant, idx) in form.variants"
              :key="idx"
              class="grid grid-cols-12 gap-3 items-center bg-[#0f0f14] border border-[#272736] p-3 rounded-xl"
            >
              <div class="col-span-3">
                <input
                  v-model="variant.title"
                  type="text"
                  placeholder="Title (50ml)"
                  class="w-full bg-[#16161e] border border-[#323245] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <div class="col-span-4">
                <input
                  v-model="variant.sku"
                  type="text"
                  placeholder="SKU (UASCENTS01)"
                  class="w-full bg-[#16161e] border border-[#323245] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none"
                />
              </div>
              <div class="col-span-4">
                <div class="relative">
                  <span class="absolute left-3 top-1.5 text-xs text-slate-500 font-medium">Rs:</span>
                  <input
                    v-model.number="variant.price"
                    type="number"
                    step="0.01"
                    placeholder="92.00"
                    class="w-full bg-[#16161e] border border-[#323245] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
              <div class="col-span-1 text-center">
                <button
                  type="button"
                  class="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  @click="removeVariant(idx)"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Gradient & Attributes (1 col wide) -->
      <div class="space-y-6">
        <!-- Gradient Picker Card -->
        <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-5">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Styling</h3>
          <AdminGradientPicker v-model="form.gradient" />
        </div>

        <!-- Gender Tags Card -->
        <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Gender Collections</h3>
          <div class="space-y-2">
            <label v-for="g in ['men', 'women', 'unisex']" :key="g" class="flex items-center gap-3 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                :checked="form.gender.includes(g)"
                class="w-4 h-4 rounded border-[#323245] bg-[#0f0f14] text-[#e5e7eb] focus:ring-0"
                @change="toggleGender(g)"
              />
              <span class="capitalize">{{ g }}</span>
            </label>
          </div>
        </div>

        <!-- Fragrance Notes Card -->
        <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Fragrance Notes</h3>
            <button type="button" class="text-xs text-[#e5e7eb] hover:underline" @click="addNote">
              + Note
            </button>
          </div>

          <div class="space-y-2">
            <div v-for="(note, idx) in form.notes" :key="idx" class="flex gap-2">
              <input
                v-model="form.notes[idx]"
                type="text"
                placeholder="e.g. Sandalwood"
                class="flex-1 bg-[#0f0f14] border border-[#323245] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
              />
              <button type="button" class="text-slate-500 hover:text-rose-400 px-2" @click="removeNote(idx)">
                &times;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
