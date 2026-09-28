<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const { fetchAllProducts, deleteProduct } = useAdmin()

const products = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const categoryFilter = ref('all')
const productToDelete = ref<any | null>(null)
const isDeleting = ref(false)

async function loadProducts() {
  loading.value = true
  try {
    products.value = await fetchAllProducts()
  } catch (err) {
    console.error('Failed loading products:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadProducts)

const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchesSearch =
      !search.value ||
      p.title.toLowerCase().includes(search.value.toLowerCase()) ||
      p.handle.toLowerCase().includes(search.value.toLowerCase())
    const matchesCategory =
      categoryFilter.value === 'all' || p.category === categoryFilter.value
    return matchesSearch && matchesCategory
  })
})

async function confirmDelete() {
  if (!productToDelete.value) return
  isDeleting.value = true
  try {
    await deleteProduct(productToDelete.value.id)
    productToDelete.value = null
    await loadProducts()
  } catch (err: any) {
    alert(err.message || 'Failed to delete product')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Products</h1>
        <p class="text-xs text-slate-400">Manage scents, objects, sets and pricing</p>
      </div>

      <NuxtLink
        to="/admin/products/new"
        class="px-4 py-2.5 bg-[#e5e7eb] hover:bg-[#d4b58a] text-ink font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Product</span>
      </NuxtLink>
    </div>

    <!-- Filters & Search -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative w-full sm:w-80">
        <svg class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search by title or handle..."
          class="w-full bg-[#0f0f14] border border-[#323245] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <span class="text-xs text-slate-400">Category:</span>
        <select
          v-model="categoryFilter"
          class="bg-[#0f0f14] border border-[#323245] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
        >
          <option value="all">All Categories</option>
          <option value="fragrance">Fragrances</option>
          <option value="object">Objects</option>
          <option value="set">Sets</option>
        </select>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl overflow-hidden shadow-xl">
      <div v-if="loading" class="text-center py-16 text-xs font-mono text-slate-500">
        Loading products list...
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center py-16 text-xs text-slate-400">
        No products found matching your search.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-[#0f0f14] border-b border-[#272736] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th class="py-3.5 px-5">Product</th>
              <th class="py-3.5 px-4">Category</th>
              <th class="py-3.5 px-4">Variants</th>
              <th class="py-3.5 px-4">Badge</th>
              <th class="py-3.5 px-4">Sort</th>
              <th class="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#232332]">
            <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-[#1f1f2c] transition-colors">
              <td class="py-4 px-5">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-xl bg-[#222230] p-1 shrink-0 border border-[#323245] flex items-center justify-center overflow-hidden">
                    <img :src="p.image_url" :alt="p.title" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 class="font-medium text-slate-100 text-sm italic font-serif">{{ p.title }}</h3>
                    <span class="font-mono text-[11px] text-slate-500">/{{ p.handle }}</span>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-mono bg-[#272738] text-slate-300">
                  {{ p.category }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="text-slate-300">{{ p.variants?.length || 0 }} variant(s)</span>
              </td>
              <td class="py-4 px-4">
                <span v-if="p.badge" class="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest bg-[#e5e7eb]/15 text-[#e5e7eb] border border-[#e5e7eb]/30">
                  {{ p.badge }}
                </span>
                <span v-else class="text-slate-600">—</span>
              </td>
              <td class="py-4 px-4 font-mono text-slate-400">
                {{ p.sort_order }}
              </td>
              <td class="py-4 px-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/products/${p.id}`"
                    class="px-3 py-1.5 bg-[#252535] hover:bg-[#323248] text-slate-200 text-xs rounded-lg border border-[#3a3a50] transition-colors"
                  >
                    Edit
                  </NuxtLink>
                  <button
                    type="button"
                    class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded-lg border border-rose-500/20 transition-colors"
                    @click="productToDelete = p"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="productToDelete" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#16161e] border border-[#272736] rounded-2xl max-w-md w-full p-6 space-y-5">
        <h3 class="text-lg font-semibold text-slate-100">Delete Product</h3>
        <p class="text-xs text-slate-400">
          Are you sure you want to delete <strong class="text-slate-200">{{ productToDelete.title }}</strong>? This action cannot be undone.
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2 bg-[#20202d] text-slate-300 text-xs rounded-lg"
            @click="productToDelete = null"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            <span v-if="isDeleting">Deleting...</span>
            <span v-else>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
