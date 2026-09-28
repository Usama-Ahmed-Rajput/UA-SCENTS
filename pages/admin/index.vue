<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const { fetchDashboardStats, fetchSubscribers, fetchAllOrders } = useAdmin()

const stats = ref({
  productsCount: 0,
  pagesCount: 0,
  subscribersCount: 0,
  gradientsCount: 0,
  ordersCount: 0
})

const recentSubscribers = ref<any[]>([])
const recentOrders = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [s, subList, ordersList] = await Promise.all([
      fetchDashboardStats(),
      fetchSubscribers(),
      fetchAllOrders()
    ])
    stats.value = s
    recentSubscribers.value = subList.slice(0, 5)
    recentOrders.value = ordersList.slice(0, 5)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Overview</h1>
        <p class="text-xs text-slate-400">Welcome to the UA SCENTS Store Manager</p>
      </div>

      <NuxtLink
        to="/admin/products/new"
        class="px-4 py-2.5 bg-[#e5e7eb] hover:bg-[#d4b58a] text-ink font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Product</span>
      </NuxtLink>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs uppercase tracking-wider text-slate-400 font-semibold">Orders</span>
          <div class="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-semibold font-mono text-slate-100">
          {{ loading ? '...' : stats.ordersCount }}
        </div>
      </div>

      <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs uppercase tracking-wider text-slate-400 font-semibold">Products</span>
          <div class="p-2 bg-[#e5e7eb]/10 text-[#e5e7eb] rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-semibold font-mono text-slate-100">
          {{ loading ? '...' : stats.productsCount }}
        </div>
      </div>

      <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs uppercase tracking-wider text-slate-400 font-semibold">Subscribers</span>
          <div class="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-semibold font-mono text-slate-100">
          {{ loading ? '...' : stats.subscribersCount }}
        </div>
      </div>

      <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs uppercase tracking-wider text-slate-400 font-semibold">Pages</span>
          <div class="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-semibold font-mono text-slate-100">
          {{ loading ? '...' : stats.pagesCount }}
        </div>
      </div>

      <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs uppercase tracking-wider text-slate-400 font-semibold">Gradients</span>
          <div class="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-semibold font-mono text-slate-100">
          {{ loading ? '...' : stats.gradientsCount }}
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Orders List -->
      <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Recent Store Orders</h3>
          <NuxtLink to="/admin/orders" class="text-xs text-slate-400 hover:text-slate-200">View All Orders</NuxtLink>
        </div>

        <div v-if="loading" class="text-xs text-slate-500 font-mono py-8 text-center">
          Loading recent orders...
        </div>

        <div v-else-if="recentOrders.length === 0" class="text-xs text-slate-500 font-mono py-8 text-center">
          No orders placed yet.
        </div>

        <div v-else class="space-y-2.5">
          <NuxtLink
            v-for="order in recentOrders"
            :key="order.id"
            :to="`/admin/orders/${order.id}`"
            class="flex items-center justify-between bg-[#0f0f14] border border-[#272736] p-3 rounded-xl text-xs hover:border-[#3d3d52] transition-colors"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-slate-200 font-semibold">{{ order.order_number }}</span>
                <span :class="['px-2 py-0.5 rounded text-[10px] uppercase font-mono border', getStatusBadge(order.status)]">
                  {{ order.status }}
                </span>
              </div>
              <p class="text-slate-400 text-[11px] mt-0.5">{{ order.first_name }} {{ order.last_name }} ({{ order.email }})</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-slate-100 font-mono">{{ formatPrice(order.total_amount) }}</p>
              <p class="text-slate-500 text-[10px]">{{ new Date(order.created_at).toLocaleDateString() }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Management Quick Access -->
      <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Management Quick Access</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NuxtLink
            to="/admin/orders"
            class="p-4 bg-[#20202d] hover:bg-[#282838] border border-[#323245] rounded-xl flex flex-col justify-between transition-colors group"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-slate-200 group-hover:text-white text-sm">Manage Orders</span>
              <svg class="w-4 h-4 text-slate-500 group-hover:text-[#e5e7eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <p class="text-xs text-slate-400">View customer orders, update statuses & fulfillment</p>
          </NuxtLink>

          <NuxtLink
            to="/admin/products"
            class="p-4 bg-[#20202d] hover:bg-[#282838] border border-[#323245] rounded-xl flex flex-col justify-between transition-colors group"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-slate-200 group-hover:text-white text-sm">Manage Products</span>
              <svg class="w-4 h-4 text-slate-500 group-hover:text-[#e5e7eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <p class="text-xs text-slate-400">Edit titles, variants, notes & product images</p>
          </NuxtLink>

          <NuxtLink
            to="/admin/pages"
            class="p-4 bg-[#20202d] hover:bg-[#282838] border border-[#323245] rounded-xl flex flex-col justify-between transition-colors group"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-slate-200 group-hover:text-white text-sm">Edit Pages Content</span>
              <svg class="w-4 h-4 text-slate-500 group-hover:text-[#e5e7eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <p class="text-xs text-slate-400">Update about page, shipping policies & FAQ items</p>
          </NuxtLink>

          <NuxtLink
            to="/admin/subscribers"
            class="p-4 bg-[#20202d] hover:bg-[#282838] border border-[#323245] rounded-xl flex flex-col justify-between transition-colors group"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-slate-200 group-hover:text-white text-sm">View Subscribers</span>
              <svg class="w-4 h-4 text-slate-500 group-hover:text-[#e5e7eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <p class="text-xs text-slate-400">Export newsletter emails to CSV format</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
