<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const { fetchSubscribers, deleteSubscriber } = useAdmin()

const subscribers = ref<any[]>([])
const loading = ref(true)
const search = ref('')

async function loadData() {
  loading.value = true
  try {
    subscribers.value = await fetchSubscribers()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const filtered = computed(() => {
  if (!search.value) return subscribers.value
  return subscribers.value.filter((s) =>
    s.email.toLowerCase().includes(search.value.toLowerCase())
  )
})

async function removeSub(id: string, email: string) {
  if (!confirm(`Are you sure you want to remove ${email} from newsletter list?`)) return
  try {
    await deleteSubscriber(id)
    await loadData()
  } catch (err: any) {
    alert(err.message || 'Failed to remove subscriber')
  }
}

function exportCSV() {
  if (subscribers.value.length === 0) return

  const headers = ['ID', 'Email', 'Subscribed At']
  const rows = subscribers.value.map((s) => [s.id, s.email, s.subscribed_at])
  
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `uascents_subscribers_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Newsletter Subscribers</h1>
        <p class="text-xs text-slate-400">View mailing list subscribers and export to CSV</p>
      </div>

      <button
        type="button"
        class="px-4 py-2.5 bg-[#252535] hover:bg-[#323248] text-slate-100 text-xs font-semibold rounded-xl border border-[#3a3a50] transition-colors flex items-center justify-center gap-2"
        :disabled="subscribers.length === 0"
        @click="exportCSV"
      >
        <svg class="w-4 h-4 text-[#e5e7eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export CSV</span>
      </button>
    </div>

    <!-- Filter/Search Bar -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-4 flex items-center justify-between">
      <div class="relative w-full sm:w-80">
        <svg class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Filter by email address..."
          class="w-full bg-[#0f0f14] border border-[#323245] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
        />
      </div>

      <span class="text-xs text-slate-400 font-mono hidden sm:inline">
        Total: {{ filtered.length }} subscriber(s)
      </span>
    </div>

    <!-- Table Card -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl overflow-hidden shadow-xl">
      <div v-if="loading" class="text-center py-16 text-xs font-mono text-slate-500">
        Loading subscribers...
      </div>

      <div v-else-if="filtered.length === 0" class="text-center py-16 text-xs text-slate-400 font-mono">
        No newsletter subscribers found.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-[#0f0f14] border-b border-[#272736] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th class="py-3.5 px-5">Email Address</th>
              <th class="py-3.5 px-4">Subscribed Date</th>
              <th class="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#232332]">
            <tr v-for="sub in filtered" :key="sub.id" class="hover:bg-[#1f1f2c] transition-colors">
              <td class="py-4 px-5 font-mono text-slate-200 font-medium">
                {{ sub.email }}
              </td>
              <td class="py-4 px-4 text-slate-400 font-mono">
                {{ new Date(sub.subscribed_at).toLocaleString() }}
              </td>
              <td class="py-4 px-5 text-right">
                <button
                  type="button"
                  class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded-lg border border-rose-500/20 transition-colors"
                  @click="removeSub(sub.id, sub.email)"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
