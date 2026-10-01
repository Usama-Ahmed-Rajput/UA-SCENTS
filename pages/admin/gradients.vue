<script setup lang="ts">
import { DEFAULT_GRADIENTS, type GradientPreset } from '~/utils/gradients'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const { fetchGradients, createGradient, deleteGradient, seedDefaultGradients } = useAdmin()
const toast = useToast()

const gradientsList = ref<GradientPreset[]>([])
const loading = ref(true)
const search = ref('')
const categoryFilter = ref('all')
const isSeeding = ref(false)

const newGradient = reactive({
  name: '',
  css_value: '',
  category: 'Warm & Cashmere'
})

const isSubmitting = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await fetchGradients()
    gradientsList.value = res && res.length > 0 ? res : DEFAULT_GRADIENTS
  } catch (err) {
    console.error(err)
    gradientsList.value = DEFAULT_GRADIENTS
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const filteredGradients = computed(() => {
  return gradientsList.value.filter((g) => {
    const matchesSearch =
      !search.value ||
      g.name.toLowerCase().includes(search.value.toLowerCase()) ||
      g.css_value.toLowerCase().includes(search.value.toLowerCase())
    const matchesCategory =
      categoryFilter.value === 'all' || g.category === categoryFilter.value
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

const availableCategories = computed(() => {
  const set = new Set<string>()
  for (const g of gradientsList.value) {
    if (g.category) set.add(g.category)
  }
  return Array.from(set)
})

async function handleCreate() {
  if (!newGradient.name || !newGradient.css_value) {
    toast.error('Please enter a name and CSS gradient string')
    return
  }

  isSubmitting.value = true
  try {
    await createGradient({
      name: newGradient.name,
      css_value: newGradient.css_value,
      category: newGradient.category
    })
    newGradient.name = ''
    newGradient.css_value = ''
    newGradient.category = 'Warm & Cashmere'
    toast.success('Gradient preset created successfully!')
    await loadData()
  } catch (err: any) {
    toast.error(err.message || 'Failed to create gradient preset')
  } finally {
    isSubmitting.value = false
  }
}

async function handleRemove(id: string, name: string) {
  if (!confirm(`Delete gradient preset "${name}"?`)) return
  try {
    await deleteGradient(id)
    toast.success(`Gradient preset "${name}" deleted`)
    await loadData()
  } catch (err: any) {
    toast.error(err.message || 'Failed to delete gradient')
  }
}

async function handleSeedDefaults() {
  if (!confirm('Import all default light & pastel gradient presets into your database?')) return
  isSeeding.value = true
  try {
    await seedDefaultGradients()
    toast.success('Default presets successfully imported!')
    await loadData()
  } catch (err: any) {
    toast.error(err.message || 'Failed to seed presets')
  } finally {
    isSeeding.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Gradient Presets Manager</h1>
        <p class="text-xs text-slate-400">Curated light & soft luxury background gradients for product cards & pages</p>
      </div>

      <button
        type="button"
        class="px-4 py-2.5 bg-[#272736] hover:bg-[#343448] text-amber-300 font-medium text-xs rounded-xl shadow-sm border border-amber-500/30 transition-colors flex items-center justify-center gap-2"
        :disabled="isSeeding"
        @click="handleSeedDefaults"
      >
        <svg v-if="isSeeding" class="animate-spin w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>Seed Default Presets to Database</span>
      </button>
    </div>

    <!-- Add New Gradient Form Card -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Add Custom Gradient Preset</h3>

      <form class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" @submit.prevent="handleCreate">
        <div>
          <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
            Preset Name
          </label>
          <input
            v-model="newGradient.name"
            type="text"
            required
            placeholder="e.g. Silk Champagne"
            class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
          />
        </div>

        <div>
          <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
            Category
          </label>
          <select
            v-model="newGradient.category"
            class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
          >
            <option value="Warm & Cashmere">Warm & Cashmere</option>
            <option value="Fresh & Airy">Fresh & Airy</option>
            <option value="Floral & Blush">Floral & Blush</option>
            <option value="Earthy & Botanical">Earthy & Botanical</option>
            <option value="Lavender & Violet">Lavender & Violet</option>
            <option value="Linen & Silk">Linen & Silk</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div>
          <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
            CSS Gradient String
          </label>
          <input
            v-model="newGradient.css_value"
            type="text"
            required
            placeholder="linear-gradient(135deg, #f8f1e5 0%, #ede1ce 100%)"
            class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
          />
        </div>

        <div>
          <button
            type="submit"
            class="w-full px-4 py-2 bg-[#e5e7eb] hover:bg-[#d4b58a] text-ink font-semibold text-xs rounded-lg transition-colors shadow-sm"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : '+ Add Preset' }}
          </button>
        </div>
      </form>

      <!-- Live Preview with text contrast check -->
      <div v-if="newGradient.css_value" class="pt-2 flex items-center gap-4">
        <span class="text-xs text-slate-400">Live Legibility Preview:</span>
        <div
          class="h-10 px-4 rounded-lg border border-black/10 flex items-center justify-between shadow-sm"
          :style="{ background: newGradient.css_value }"
        >
          <span class="text-xs font-serif italic text-black font-bold">UA SCENTS sample text</span>
          <span class="text-[10px] font-mono text-black font-semibold">Rs: 15,000</span>
        </div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative w-full sm:w-80">
        <svg class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search by preset name or hex colors..."
          class="w-full bg-[#0f0f14] border border-[#323245] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <span class="text-xs text-slate-400">Category:</span>
        <select
          v-model="categoryFilter"
          class="bg-[#0f0f14] border border-[#323245] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
        >
          <option value="all">All Categories ({{ gradientsList.length }})</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <!-- Existing Gradients Grid -->
    <div v-if="loading" class="text-center py-16 text-xs font-mono text-slate-500">
      Loading gradients list...
    </div>

    <div v-else-if="Object.keys(categoriesMap).length === 0" class="text-center py-16 text-xs text-slate-400">
      No gradients match your search query.
    </div>

    <div v-else class="space-y-8">
      <div v-for="(items, category) in categoriesMap" :key="category" class="space-y-4">
        <div class="flex items-center justify-between border-b border-[#272736] pb-2">
          <h3 class="text-xs uppercase tracking-widest text-[#e5e7eb] font-semibold">
            {{ category }} ({{ items.length }})
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="g in items"
            :key="g.id"
            class="bg-[#16161e] border border-[#272736] rounded-xl p-3 space-y-2.5 flex flex-col justify-between group hover:border-[#44445c] transition-colors shadow-md"
          >
            <!-- Swatch card showing actual text contrast on top of light background -->
            <div
              class="w-full aspect-video rounded-lg shadow-inner border border-black/10 p-3 flex flex-col justify-between overflow-hidden"
              :style="{ background: g.css_value }"
            >
              <div class="flex items-center justify-between text-black opacity-80">
                <span class="text-[9px] uppercase tracking-wider font-bold">UA SCENTS</span>
                <span class="text-[9px] font-mono">100ml</span>
              </div>
              <div>
                <p class="text-xs font-serif italic font-bold text-black leading-tight">Sample Scents Title</p>
                <p class="text-[10px] text-black font-medium opacity-80 font-mono">Rs: 12,500</p>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-200 truncate pr-1">{{ g.name }}</span>
                <button
                  type="button"
                  class="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                  title="Delete preset"
                  @click="handleRemove(g.id, g.name)"
                >
                  &times;
                </button>
              </div>
              <p class="text-[10px] font-mono text-slate-500 truncate mt-0.5" :title="g.css_value">
                {{ g.css_value }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
