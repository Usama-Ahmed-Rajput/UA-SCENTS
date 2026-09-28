<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const { fetchAllOrders, updateOrderStatus, deleteOrder } = useAdmin()

const orders = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')

const orderToDelete = ref<any | null>(null)
const isDeleting = ref(false)

async function loadOrders() {
  loading.value = true
  try {
    orders.value = await fetchAllOrders()
  } catch (err) {
    console.error('Error loading orders:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadOrders)

const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    const term = search.value.toLowerCase()
    const emailStr = o.email || o.customer_email || ''
    const nameStr = o.first_name ? `${o.first_name} ${o.last_name || ''}` : (o.customer_name || '')
    const matchesSearch =
      !search.value ||
      o.order_number?.toLowerCase().includes(term) ||
      emailStr.toLowerCase().includes(term) ||
      nameStr.toLowerCase().includes(term)

    const matchesStatus =
      statusFilter.value === 'all' || o.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
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

async function quickUpdateStatus(orderId: string, newStatus: string) {
  try {
    await updateOrderStatus(orderId, newStatus)
    await loadOrders()
  } catch (err: any) {
    alert(err.message || 'Failed to update status')
  }
}

async function confirmDelete() {
  if (!orderToDelete.value) return
  isDeleting.value = true
  try {
    await deleteOrder(orderToDelete.value.id)
    orderToDelete.value = null
    await loadOrders()
  } catch (err: any) {
    alert(err.message || 'Failed to delete order')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-100">Orders Management</h1>
      <p class="text-xs text-slate-400">View customer orders, update fulfillment statuses and inspect line items</p>
    </div>

    <!-- Search & Status Filter -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative w-full sm:w-80">
        <svg class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search by order #, customer name, email..."
          class="w-full bg-[#0f0f14] border border-[#323245] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <span class="text-xs text-slate-400">Status:</span>
        <select
          v-model="statusFilter"
          class="bg-[#0f0f14] border border-[#323245] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Orders Table Card -->
    <div class="bg-[#16161e] border border-[#272736] rounded-2xl overflow-hidden shadow-xl">
      <div v-if="loading" class="text-center py-16 text-xs font-mono text-slate-500">
        Loading orders list...
      </div>

      <div v-else-if="filteredOrders.length === 0" class="text-center py-16 text-xs text-slate-400 font-mono">
        No orders found matching your query.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-[#0f0f14] border-b border-[#272736] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th class="py-3.5 px-5">Order #</th>
              <th class="py-3.5 px-4">Customer</th>
              <th class="py-3.5 px-4">Items</th>
              <th class="py-3.5 px-4">Total</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4">Date</th>
              <th class="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#232332]">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-[#1f1f2c] transition-colors">
              <td class="py-4 px-5 font-mono font-semibold text-slate-200">
                <NuxtLink :to="`/admin/orders/${order.id}`" class="hover:text-[#e5e7eb] underline underline-offset-4">
                  {{ order.order_number }}
                </NuxtLink>
              </td>
              <td class="py-4 px-4">
                <div>
                  <p class="font-medium text-slate-100">
                    {{ order.first_name ? `${order.first_name} ${order.last_name || ''}` : (order.customer_name || 'Customer') }}
                  </p>
                  <p class="text-[11px] text-slate-500 font-mono">{{ order.email || order.customer_email || 'No contact info' }}</p>
                </div>
              </td>
              <td class="py-4 px-4 font-mono text-slate-300">
                {{ order.order_items?.length || 0 }} item(s)
              </td>
              <td class="py-4 px-4 font-mono font-semibold text-slate-100">
                {{ formatPrice(order.total_amount ?? order.total ?? 0) }}
              </td>
              <td class="py-4 px-4">
                <select
                  :value="order.status"
                  :class="['px-2.5 py-1 rounded-md text-[11px] font-mono border focus:outline-none cursor-pointer', getStatusBadge(order.status)]"
                  @change="quickUpdateStatus(order.id, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="pending" class="bg-[#16161e] text-slate-100">Pending</option>
                  <option value="processing" class="bg-[#16161e] text-slate-100">Processing</option>
                  <option value="shipped" class="bg-[#16161e] text-slate-100">Shipped</option>
                  <option value="delivered" class="bg-[#16161e] text-slate-100">Delivered</option>
                  <option value="cancelled" class="bg-[#16161e] text-slate-100">Cancelled</option>
                </select>
              </td>
              <td class="py-4 px-4 text-slate-500 font-mono text-[11px]">
                {{ new Date(order.created_at).toLocaleDateString() }}
              </td>
              <td class="py-4 px-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/orders/${order.id}`"
                    class="px-3 py-1.5 bg-[#252535] hover:bg-[#323248] text-slate-200 text-xs rounded-lg border border-[#3a3a50] transition-colors"
                  >
                    View
                  </NuxtLink>
                  <button
                    type="button"
                    class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded-lg border border-rose-500/20 transition-colors"
                    @click="orderToDelete = order"
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

    <!-- Delete Order Confirmation Modal -->
    <div v-if="orderToDelete" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#16161e] border border-[#272736] rounded-2xl max-w-md w-full p-6 space-y-5">
        <h3 class="text-lg font-semibold text-slate-100">Delete Order</h3>
        <p class="text-xs text-slate-400">
          Are you sure you want to delete order <strong class="text-slate-200 font-mono">{{ orderToDelete.order_number }}</strong>? This action cannot be undone.
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2 bg-[#20202d] text-slate-300 text-xs rounded-lg"
            @click="orderToDelete = null"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            <span>{{ isDeleting ? 'Deleting...' : 'Confirm Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
