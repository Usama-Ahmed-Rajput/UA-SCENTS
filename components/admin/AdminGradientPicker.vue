<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { fetchGradients } = useAdmin()
const isOpen = ref(false)
const gradientsList = ref<any[]>([])
const loading = ref(false)

const defaultPresets = [
  { id: 'g1', name: 'Dune (Sage Green)', category: 'Earthy & Green', css_value: 'linear-gradient(135deg, #b8c4a8 0%, #a0b090 100%)' },
  { id: 'g2', name: 'Royal Vanilla (Warm Cashmere)', category: 'Warm & Cream', css_value: 'linear-gradient(135deg, #f5ecd8 0%, #e8dcc0 100%)' },
  { id: 'g3', name: 'Amalfi Coast (Sky Blue)', category: 'Fresh & Ocean', css_value: 'linear-gradient(135deg, #eaf0f6 0%, #d8e4ee 100%)' },
  { id: 'g4', name: 'Moroccan Souk (Spiced Tan)', category: 'Warm & Cream', css_value: 'linear-gradient(135deg, #f5ecd8 0%, #e8dcc0 100%)' },
  { id: 'g5', name: 'French Lavande (Soft Lavender)', category: 'Floral & Soft', css_value: 'linear-gradient(135deg, #e8e0f0 0%, #d8d0e8 100%)' },
  { id: 'g6', name: 'Rebel Moon (Blush Rose)', category: 'Floral & Soft', css_value: 'linear-gradient(135deg, #e0c0b8 0%, #d0a8a0 100%)' },
  { id: 'g7', name: 'Disfruta (Ice Blue)', category: 'Fresh & Ocean', css_value: 'linear-gradient(135deg, #e0ecf4 0%, #c8dde8 100%)' },
  { id: 'g8', name: 'Gold Rush (Peach Glow)', category: 'Floral & Soft', css_value: 'linear-gradient(135deg, #f5e0e0 0%, #ecc8cc 100%)' },
  { id: 'g9', name: 'Azur (Emerald Mint)', category: 'Earthy & Green', css_value: 'linear-gradient(135deg, #c0d4c8 0%, #a8c0b0 100%)' },
  { id: 'g10', name: 'Qahwa (Warm Cinnamon)', category: 'Warm & Cream', css_value: 'linear-gradient(135deg, #f5e6c8 0%, #edd8b0 100%)' },
  { id: 'g11', name: 'Oud Essence (Amber Wood)', category: 'Earthy & Woody', css_value: 'linear-gradient(135deg, #d4a07a 0%, #c08860 100%)' },
  { id: 'g12', name: 'Ananas Royal (Golden Velvet)', category: 'Warm & Cream', css_value: 'linear-gradient(135deg, #e8d470 0%, #d4bc50 100%)' }
]

async function openPicker() {
  isOpen.value = true
  if (gradientsList.value.length === 0) {
    loading.value = true
    try {
      const res = await fetchGradients()
      gradientsList.value = res && res.length > 0 ? res : defaultPresets
    } catch {
      gradientsList.value = defaultPresets
    } finally {
      loading.value = false
    }
  }
}

const categories = computed(() => {
  const map: Record<string, any[]> = {}
  for (const g of gradientsList.value) {
    const cat = g.category || 'general'
    if (!map[cat]) map[cat] = []
    map[cat].push(g)
  }
  return map
})

function selectGradient(cssValue: string) {
  emit('update:modelValue', cssValue)
  isOpen.value = false
}
</script>

<template>
  <div class="space-y-2">
    <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold">
      Background Gradient
    </label>

    <div class="flex gap-3 items-center">
      <!-- Live gradient swatch box -->
      <div
        class="w-12 h-10 rounded-lg border border-[#323245] shadow-inner shrink-0 transition-all"
        :style="{ background: modelValue || '#1f1f2e' }"
      />

      <!-- Text input for raw CSS gradient -->
      <!-- <input
        :value="modelValue"
        type="text"
        placeholder="linear-gradient(135deg, #...)"
        class="flex-1 bg-[#16161e] border border-[#323245] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#e5e7eb]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      /> -->

      <!-- Button to open visual picker modal -->
      <button
        type="button"
        class="px-3.5 py-2 bg-[#272736] hover:bg-[#323245] text-slate-200 text-xs font-medium rounded-lg transition-colors border border-[#3a3a50] flex items-center gap-1.5 shrink-0"
        @click="openPicker"
      >
        <svg class="w-4 h-4 text-[#e5e7eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        Pick Preset
      </button>
    </div>

    <!-- Modal overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="isOpen = false"
    >
      <div class="bg-[#16161e] border border-[#272736] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Modal header -->
        <div class="px-6 py-4 border-b border-[#272736] flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-slate-100">Select Background Gradient</h3>
            <p class="text-xs text-slate-400">Choose from curated presets matching UA SCENTS aesthetic</p>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-[#242436]"
            @click="isOpen = false"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal content body -->
        <div class="p-6 overflow-y-auto space-y-6">
          <div v-if="loading" class="text-center py-12 text-slate-400 text-xs font-mono">
            Loading gradient presets...
          </div>

          <div v-else v-for="(items, category) in categories" :key="category" class="space-y-3">
            <h4 class="text-xs uppercase tracking-widest text-[#e5e7eb] font-semibold">
              {{ category }} ({{ items.length }})
            </h4>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button
                v-for="item in items"
                :key="item.id"
                type="button"
                class="group flex flex-col items-start rounded-xl p-2.5 bg-[#20202d] border transition-all text-left"
                :class="modelValue === item.css_value ? 'border-[#e5e7eb] ring-2 ring-[#e5e7eb]/30' : 'border-[#2d2d3e] hover:border-[#4a4a65]'"
                @click="selectGradient(item.css_value)"
              >
                <div
                  class="w-full aspect-video rounded-lg shadow-inner mb-2 transition-transform group-hover:scale-[1.02]"
                  :style="{ background: item.css_value }"
                />
                <span class="text-xs font-medium text-slate-200 group-hover:text-white truncate w-full">
                  {{ item.name }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
