<script setup lang="ts">
import { DEFAULT_GRADIENTS, type GradientPreset } from '~/utils/gradients'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { fetchGradients } = useAdmin()
const isOpen = ref(false)
const gradientsList = ref<GradientPreset[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategoryFilter = ref('all')

async function openPicker() {
  isOpen.value = true
  if (gradientsList.value.length === 0) {
    loading.value = true
    try {
      const res = await fetchGradients()
      gradientsList.value = res && res.length > 0 ? res : DEFAULT_GRADIENTS
    } catch {
      gradientsList.value = DEFAULT_GRADIENTS
    } finally {
      loading.value = false
    }
  }
}

const filteredGradients = computed(() => {
  return gradientsList.value.filter((g) => {
    const matchesSearch =
      !searchQuery.value ||
      g.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesCategory =
      selectedCategoryFilter.value === 'all' || g.category === selectedCategoryFilter.value
    return matchesSearch && matchesCategory
  })
})

const categoriesMap = computed(() => {
  const map: Record<string, GradientPreset[]> = {}
  for (const g of filteredGradients.value) {
    const cat = g.category || 'General'
    if (!map[cat]) map[cat] = []
    map[cat].push(g)
  }
  return map
})

const allCategoryNames = computed(() => {
  const set = new Set<string>()
  for (const g of gradientsList.value) {
    if (g.category) set.add(g.category)
  }
  return Array.from(set)
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
      <!-- Live gradient swatch box with preview text -->
      <div
        class="w-20 h-10 rounded-lg border border-[#323245] shadow-inner shrink-0 flex items-center justify-center p-1 overflow-hidden"
        :style="{ background: modelValue || 'linear-gradient(135deg, #f8f1e5 0%, #ede1ce 100%)' }"
      >
        <span class="text-[9px] font-serif italic text-black font-bold tracking-tight opacity-90 truncate">
          UA SCENTS
        </span>
      </div>

      <!-- Button to open visual picker modal -->
      <button
        type="button"
        class="px-3.5 py-2 bg-[#272736] hover:bg-[#323245] text-slate-200 text-xs font-medium rounded-lg transition-colors border border-[#3a3a50] flex items-center gap-1.5 shrink-0"
        @click="openPicker"
      >
        <svg class="w-4 h-4 text-[#e5e7eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        Pick Gradient Preset
      </button>
    </div>

    <!-- Modal overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="isOpen = false"
    >
      <div class="bg-[#16161e] border border-[#272736] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Modal header -->
        <div class="px-6 py-4 border-b border-[#272736] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-semibold text-slate-100">Select Background Gradient</h3>
            <p class="text-xs text-slate-400">Curated light & soft luxury presets with crisp text legibility</p>
          </div>

          <div class="flex items-center gap-3">
            <!-- Search input -->
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search gradient name..."
              class="bg-[#0f0f14] border border-[#323245] rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb] w-44"
            />
            <!-- Category Filter -->
            <select
              v-model="selectedCategoryFilter"
              class="bg-[#0f0f14] border border-[#323245] rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
            >
              <option value="all">All Categories</option>
              <option v-for="cat in allCategoryNames" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <!-- Close button -->
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
        </div>

        <!-- Modal content body -->
        <div class="p-6 overflow-y-auto space-y-6">
          <div v-if="loading" class="text-center py-12 text-slate-400 text-xs font-mono">
            Loading gradient presets...
          </div>

          <div v-else-if="Object.keys(categoriesMap).length === 0" class="text-center py-12 text-slate-400 text-xs">
            No gradients found matching search query.
          </div>

          <div v-else v-for="(items, category) in categoriesMap" :key="category" class="space-y-3">
            <h4 class="text-xs uppercase tracking-widest text-[#e5e7eb] font-semibold border-b border-[#272736] pb-1.5">
              {{ category }} ({{ items.length }})
            </h4>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button
                v-for="item in items"
                :key="item.id"
                type="button"
                class="group flex flex-col items-start rounded-xl p-2.5 bg-[#20202d] border transition-all text-left"
                :class="modelValue === item.css_value ? 'border-[#e5e7eb] ring-2 ring-[#e5e7eb]/40' : 'border-[#2d2d3e] hover:border-[#4a4a65]'"
                @click="selectGradient(item.css_value)"
              >
                <!-- Swatch with Live Text Preview -->
                <div
                  class="w-full aspect-video rounded-lg shadow-inner mb-2 transition-transform group-hover:scale-[1.02] p-2 flex flex-col justify-between overflow-hidden border border-black/10"
                  :style="{ background: item.css_value }"
                >
                  <span class="text-[9px] uppercase tracking-wider font-bold text-black opacity-80">UA SCENTS</span>
                  <span class="text-xs font-serif italic font-bold text-black leading-tight">Readable Text</span>
                </div>

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
