<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const { fetchAllPages, seedDefaultPages } = useAdmin()
const toast = useToast()

const pagesList = ref<any[]>([])
const loading = ref(true)
const seeding = ref(false)

async function loadPages() {
  loading.value = true
  try {
    pagesList.value = await fetchAllPages()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function handleSeedPages() {
  if (seeding.value) return
  seeding.value = true
  try {
    pagesList.value = await seedDefaultPages()
    toast.success('Default store pages seeded successfully!')
  } catch (err: any) {
    toast.error(err.message || 'Failed to seed default pages')
  } finally {
    seeding.value = false
  }
}

onMounted(() => {
  loadPages()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Pages Content</h1>
        <p class="text-xs text-slate-400">Edit titles, hero descriptions, image headers and FAQ items</p>
      </div>

      <div>
        <button
          type="button"
          class="px-4 py-2 bg-[#252535] hover:bg-[#323248] text-slate-200 text-xs rounded-xl border border-[#3a3a50] transition-colors font-medium flex items-center gap-2"
          :disabled="seeding || loading"
          @click="handleSeedPages"
        >
          <span v-if="seeding" class="animate-spin text-amber-400">↻</span>
          <span>{{ seeding ? 'Seeding Default Pages...' : 'Seed Default Pages' }}</span>
        </button>
      </div>
    </div>

    <div class="bg-[#16161e] border border-[#272736] rounded-2xl overflow-hidden shadow-xl">
      <div v-if="loading" class="text-center py-16 text-xs font-mono text-slate-500">
        Loading pages list...
      </div>

      <div v-else-if="pagesList.length === 0" class="text-center py-16 px-6 space-y-4">
        <p class="text-slate-400 text-sm">No page contents found in database.</p>
        <button
          type="button"
          class="px-4 py-2 bg-cream text-ink font-semibold text-xs rounded-lg hover:bg-white transition-colors"
          :disabled="seeding"
          @click="handleSeedPages"
        >
          {{ seeding ? 'Populating...' : 'Seed Default Store Pages' }}
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-[#0f0f14] border-b border-[#272736] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th class="py-3.5 px-5">Page Title</th>
              <th class="py-3.5 px-4">Slug</th>
              <th class="py-3.5 px-4">Description Snippet</th>
              <th class="py-3.5 px-4">Hero Image</th>
              <th class="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#232332]">
            <tr v-for="p in pagesList" :key="p.id || p.slug" class="hover:bg-[#1f1f2c] transition-colors">
              <td class="py-4 px-5">
                <span class="font-medium text-slate-100 text-sm font-serif italic">{{ p.title }}</span>
              </td>
              <td class="py-4 px-4 font-mono text-slate-400">
                /{{ p.slug }}
              </td>
              <td class="py-4 px-4 max-w-xs truncate text-slate-400">
                {{ p.description }}
              </td>
              <td class="py-4 px-4">
                <span v-if="p.image" class="text-emerald-400 font-mono text-[11px]">Yes</span>
                <span v-else class="text-slate-600">—</span>
              </td>
              <td class="py-4 px-5 text-right">
                <NuxtLink
                  :to="`/admin/pages/${p.id || p.slug}`"
                  class="px-3.5 py-1.5 bg-[#252535] hover:bg-[#323248] text-slate-200 text-xs rounded-lg border border-[#3a3a50] transition-colors inline-block font-sans"
                >
                  Edit Content
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
