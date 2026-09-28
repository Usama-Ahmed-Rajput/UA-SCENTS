<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const { fetchGradients, createGradient, deleteGradient } = useAdmin()

const gradientsList = ref<any[]>([])
const loading = ref(true)

const newGradient = reactive({
  name: '',
  css_value: '',
  category: 'general'
})

const isSubmitting = ref(false)

async function loadData() {
  loading.value = true
  try {
    gradientsList.value = await fetchGradients()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const categoriesMap = computed(() => {
  const map: Record<string, any[]> = {}
  for (const g of gradientsList.value) {
    const cat = g.category || 'general'
    if (!map[cat]) map[cat] = []
    map[cat].push(g)
  }
  return map
})

async function handleCreate() {
  if (!newGradient.name || !newGradient.css_value) {
    alert('Please enter a name and CSS gradient string')
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
    newGradient.category = 'general'
    await loadData()
  } catch (err: any) {
    alert(err.message || 'Failed to create gradient')
  } finally {
    isSubmitting.value = false
  }
}

async function handleRemove(id: string, name: string) {
  if (!confirm(`Delete gradient preset "${name}"?`)) return
  try {
    await deleteGradient(id)
    await loadData()
  } catch (err: any) {
    alert(err.message || 'Failed to delete gradient')
  }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-semibold text-slate-100">Gradient Presets Manager</h1>
      <p class="text-xs text-slate-400">Manage CSS background color gradients available when creating/editing products</p>
    </div>

    <!-- Create New Gradient Form -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Add New Gradient Preset</h3>

      <form class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" @submit.prevent="handleCreate">
        <div>
          <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
            Preset Name
          </label>
          <input
            v-model="newGradient.name"
            type="text"
            required
            placeholder="e.g. Amber Glow"
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
            <option value="warm">Warm / Amber</option>
            <option value="cool">Cool / Blue</option>
            <option value="earthy">Earthy / Green</option>
            <option value="rose">Rose / Pink</option>
            <option value="neutral">Neutral / Linen</option>
            <option value="premium">Premium / Dark</option>
            <option value="general">General</option>
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
            placeholder="linear-gradient(135deg, #...)"
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

      <!-- Live Preview of new gradient -->
      <div v-if="newGradient.css_value" class="pt-2 flex items-center gap-3">
        <span class="text-xs text-slate-400">Live Preview:</span>
        <div
          class="h-8 w-32 rounded-lg border border-[#323245]"
          :style="{ background: newGradient.css_value }"
        />
      </div>
    </div>

    <!-- Existing Gradients Grid -->
    <div v-if="loading" class="text-center py-16 text-xs font-mono text-slate-500">
      Loading gradients list...
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
            class="bg-[#16161e] border border-[#272736] rounded-xl p-3 space-y-2.5 flex flex-col justify-between group hover:border-[#44445c] transition-colors"
          >
            <div
              class="w-full aspect-video rounded-lg shadow-inner border border-[#323245]"
              :style="{ background: g.css_value }"
            />

            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-200">{{ g.name }}</span>
                <button
                  type="button"
                  class="text-slate-500 hover:text-rose-400 p-1 transition-colors"
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
