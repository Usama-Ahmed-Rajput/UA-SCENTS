<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const route = useRoute()
const router = useRouter()
const { fetchOrderDetails, updateOrderStatus } = useAdmin()

const orderId = computed(() => route.params.id as string)
const order = ref<any | null>(null)
const loading = ref(true)
const updating = ref(false)

async function loadDetails() {
  loading.value = true
  try {
    order.value = await fetchOrderDetails(orderId.value)
  } catch (err) {
    console.error(err)
    alert('Order not found')
    router.push('/admin/orders')
  } finally {
    loading.value = false
  }
}

onMounted(loadDetails)

async function handleStatusChange(newStatus: string) {
  if (!order.value) return
  updating.value = true
  try {
    await updateOrderStatus(orderId.value, newStatus)
    order.value.status = newStatus
  } catch (err: any) {
    alert(err.message || 'Failed to update status')
  } finally {
    updating.value = false
  }
}

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
    <div v-if="loading" class="py-24 text-center text-xs font-mono text-slate-500">
      Loading order details...
    </div>

    <div v-else-if="order" class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272736] pb-6">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-semibold text-slate-100 font-mono">{{ order.order_number }}</h1>
            <span :class="['px-3 py-1 rounded-md text-xs uppercase font-mono border font-semibold', getStatusBadge(order.status)]">
              {{ order.status }}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Placed on {{ new Date(order.created_at).toLocaleString() }}</p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/admin/orders"
            class="px-4 py-2 bg-[#20202d] text-slate-300 text-xs font-medium rounded-lg border border-[#323245]"
          >
            ← Back to Orders
          </NuxtLink>

          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400">Update Status:</span>
            <select
              :value="order.status"
              :disabled="updating"
              class="bg-[#16161e] border border-[#323245] rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              @change="handleStatusChange(($event.target as HTMLSelectElement).value)"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 2 Columns: Order Line Items & Customer/Shipping Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Line Items (2 cols wide) -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-5">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Order Line Items</h3>

            <div class="divide-y divide-[#232332]">
              <div
                v-for="item in order.order_items"
                :key="item.id"
                class="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
              >
                <div class="w-16 h-16 rounded-xl bg-[#222230] p-1.5 shrink-0 border border-[#323245] flex items-center justify-center overflow-hidden">
                  <img :src="item.image_url" :alt="item.product_title" class="w-full h-full object-contain" />
                </div>

                <div class="flex-1 flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-slate-100 text-sm font-serif italic">{{ item.product_title }}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">{{ item.variant_title }} &times; {{ item.quantity }}</p>
                    <p v-if="item.sku" class="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {{ item.sku }}</p>
                  </div>

                  <div class="text-right">
                    <p class="font-mono text-sm font-semibold text-slate-100">
                      {{ formatPrice(Number(item.price) * item.quantity) }}
                    </p>
                    <p class="text-[10px] text-slate-500 font-mono">{{ formatPrice(item.price) }} each</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total summary -->
            <div class="border-t border-[#272736] pt-4 space-y-2 text-xs">
              <div class="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span class="font-mono">{{ formatPrice(order.total_amount) }}</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span class="font-mono text-emerald-400">Free Ground</span>
              </div>
              <div class="flex justify-between text-sm font-semibold text-slate-100 pt-2 border-t border-[#272736]">
                <span>Total Amount Paid</span>
                <span class="font-mono text-[#e5e7eb]">{{ formatPrice(order.total_amount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Customer & Shipping Address (1 col wide) -->
        <div class="space-y-6">
          <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Customer Information</h3>

            <div class="space-y-3 text-xs">
              <div>
                <span class="text-slate-500 uppercase tracking-wider text-[10px] block">Full Name</span>
                <p class="font-medium text-slate-200 text-sm mt-0.5">{{ order.first_name }} {{ order.last_name }}</p>
              </div>

              <div>
                <span class="text-slate-500 uppercase tracking-wider text-[10px] block">Email Address</span>
                <p class="font-mono text-slate-300 mt-0.5">{{ order.email }}</p>
              </div>
            </div>
          </div>

          <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Shipping Address</h3>

            <div class="text-xs text-slate-300 leading-relaxed font-mono space-y-1">
              <p>{{ order.first_name }} {{ order.last_name }}</p>
              <p>{{ order.address }}</p>
              <p>{{ order.city }}, {{ order.zip_code }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
