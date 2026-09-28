<script setup lang="ts">
const { lines, subtotal, clearCart } = useCart()

const shippingCost = 0
const total = computed(() => subtotal.value + shippingCost)

const placingOrder = ref(false)
const orderPlaced = ref(false)
const confirmedOrderNumber = ref('')

// Toast Notification State
const toastMessage = ref('')
const toastType = ref<'warning' | 'error' | 'success'>('warning')
let toastTimer: any = null

function showToast(msg: string, type: 'warning' | 'error' | 'success' = 'warning') {
  toastMessage.value = msg
  toastType.value = type
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 5000)
}

const form = reactive({
  contactInfo: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  zipCode: '',
  paymentMethod: 'cod'
})

function selectPaymentMethod(method: 'cod' | 'card') {
  form.paymentMethod = method
  if (method === 'card') {
    showToast('Credit / Debit Card payment is currently under integration. Please use Cash on Delivery (COD) to place your order.', 'warning')
  }
}

async function placeOrder() {
  if (lines.value.length === 0) return
  
  if (form.paymentMethod === 'card') {
    showToast('Online card payment is currently pending integration. Please switch to Cash on Delivery (COD) to place your order.', 'warning')
    return
  }

  placingOrder.value = true
  const orderNum = `UAS-${Math.floor(100000 + Math.random() * 900000)}`
  confirmedOrderNumber.value = orderNum

  try {
    const supabase = useSupabaseClient()
    
    let orderData = null
    let orderErr = null

    // Try full insert with both schema aliases
    const res1 = await supabase
      .from('orders')
      .insert({
        order_number: orderNum,
        email: form.contactInfo,
        customer_email: form.contactInfo,
        first_name: form.firstName,
        last_name: form.lastName,
        customer_name: `${form.firstName} ${form.lastName}`.trim(),
        address: form.address,
        city: form.city,
        zip_code: form.zipCode,
        total_amount: total.value,
        total: total.value,
        subtotal: subtotal.value,
        status: 'pending'
      })
      .select()
      .single()

    if (res1.error) {
      console.warn('Initial order insert attempt notice:', res1.error)
      // Fallback 1: schema matching supabase_schema.sql strictly
      const res2 = await supabase
        .from('orders')
        .insert({
          order_number: orderNum,
          customer_email: form.contactInfo,
          customer_name: `${form.firstName} ${form.lastName}`.trim(),
          shipping_address: {
            address: form.address,
            city: form.city,
            zip_code: form.zipCode
          },
          subtotal: subtotal.value,
          total: total.value,
          status: 'pending'
        })
        .select()
        .single()

      if (res2.error) {
        // Fallback 2: minimal core columns
        const res3 = await supabase
          .from('orders')
          .insert({
            order_number: orderNum,
            email: form.contactInfo,
            first_name: form.firstName,
            last_name: form.lastName,
            address: form.address,
            city: form.city,
            zip_code: form.zipCode,
            total_amount: total.value,
            status: 'pending'
          })
          .select()
          .single()

        orderData = res3.data
        orderErr = res3.error
      } else {
        orderData = res2.data
      }
    } else {
      orderData = res1.data
    }

    if (orderErr || !orderData) {
      console.error('Error inserting order:', orderErr)
      showToast('Failed to save order to database: ' + (orderErr?.message || 'Database connection error'), 'error')
      placingOrder.value = false
      return
    }

    // Insert line items
    const itemsToInsert = lines.value.map((line) => ({
      order_id: orderData.id,
      title: line.title,
      product_title: line.title,
      variant_title: line.variant.title,
      sku: line.variant.sku || '',
      price: line.variant.price,
      quantity: line.quantity,
      image_url: line.image
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert)
    if (itemsErr) {
      console.warn('Order items insert fallback:', itemsErr)
      const itemsFallback = lines.value.map((line) => ({
        order_id: orderData.id,
        title: line.title,
        variant_title: line.variant.title,
        price: line.variant.price,
        quantity: line.quantity,
        image_url: line.image
      }))
      await supabase.from('order_items').insert(itemsFallback)
    }

    orderPlaced.value = true
    clearCart()
  } catch (err: any) {
    console.error('Error placing order in Supabase:', err)
    showToast('Failed to place order: ' + (err.message || 'Unexpected error occurred'), 'error')
  } finally {
    placingOrder.value = false
  }
}
</script>

<template>
  <div class="container-lore py-16 relative">
    <!-- Floating Luxury Toast Notification -->
    <Transition name="toast">
      <div 
        v-if="toastMessage" 
        class="fixed top-20 right-6 z-50 max-w-sm sm:max-w-md bg-ink/95 text-cream px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-cream/20 flex items-start gap-3.5 transition-all duration-300"
      >
        <div class="mt-0.5 shrink-0 text-amber-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1 text-xs leading-relaxed font-sans">
          <p class="font-semibold text-cream mb-0.5">Payment Notice</p>
          <p class="text-cream/80">{{ toastMessage }}</p>
        </div>
        <button type="button" class="text-cream/40 hover:text-cream text-sm transition-colors" @click="toastMessage = ''">✕</button>
      </div>
    </Transition>

    <div v-if="orderPlaced" class="max-w-lg mx-auto text-center py-24">
      <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="eyebrow mb-2">Thank you for your order</p>
      <h1 class="font-serif text-3xl md:text-4xl mb-3">Order Confirmed!</h1>
      <p class="text-sm font-mono text-ink/70 mb-2">Order #: {{ confirmedOrderNumber }}</p>
      <p class="text-ink/60 mb-8 max-w-md mx-auto text-sm">
        We've received your order. Payment will be collected via <strong>Cash on Delivery</strong> when your order is delivered to your address.
      </p>
      <NuxtLink to="/" class="btn-primary">Back to Store</NuxtLink>
    </div>

    <template v-else>
      <h1 class="font-serif text-3xl md:text-4xl my-10">Checkout</h1>

      <div class="grid md:grid-cols-3 gap-12 items-start">
        <form class="md:col-span-2 space-y-10" @submit.prevent="placeOrder">
          <!-- Contact Details -->
          <fieldset>
            <legend class="eyebrow mb-3">Contact Information</legend>
            <div>
              <label class="block text-xs uppercase tracking-wider text-ink/60 mb-1.5 font-medium">
                Email address or Phone number
              </label>
              <input
                v-model="form.contactInfo"
                type="text"
                required
                placeholder="e.g. name@example.com or 03001234567"
                class="w-full border border-line bg-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink"
              />
            </div>
          </fieldset>

          <!-- Shipping Address -->
          <fieldset>
            <legend class="eyebrow mb-3">Shipping Address</legend>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs uppercase tracking-wider text-ink/60 mb-1.5 font-medium">First name</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="First name"
                  class="w-full border border-line bg-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label class="block text-xs uppercase tracking-wider text-ink/60 mb-1.5 font-medium">Last name</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  class="w-full border border-line bg-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-xs uppercase tracking-wider text-ink/60 mb-1.5 font-medium">Street Address</label>
                <input
                  v-model="form.address"
                  type="text"
                  required
                  placeholder="House number, street address, area"
                  class="w-full border border-line bg-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label class="block text-xs uppercase tracking-wider text-ink/60 mb-1.5 font-medium">City</label>
                <input
                  v-model="form.city"
                  type="text"
                  required
                  placeholder="City"
                  class="w-full border border-line bg-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label class="block text-xs uppercase tracking-wider text-ink/60 mb-1.5 font-medium">ZIP Code</label>
                <input
                  v-model="form.zipCode"
                  type="text"
                  required
                  placeholder="ZIP / Postal code"
                  class="w-full border border-line bg-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink"
                />
              </div>
            </div>
          </fieldset>

          <!-- Payment Options -->
          <fieldset>
            <legend class="eyebrow mb-3">Payment Method</legend>
            <div class="space-y-3">
              <!-- COD Option -->
              <div class="flex items-start gap-4 p-4 rounded-xl border border-ink bg-ink/5 shadow-sm">
                <input
                  checked
                  disabled
                  type="radio"
                  name="payment"
                  value="cod"
                  class="mt-1 accent-ink"
                />
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-sm text-ink">Cash on Delivery (COD)</span>
                    <span class="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700">Available</span>
                  </div>
                  <p class="text-xs text-ink/60 mt-1">
                    Pay with cash upon physical delivery of your order to your doorstep.
                  </p>
                </div>
              </div>
            </div>
          </fieldset>

          <button 
            type="submit" 
            class="btn-primary w-full py-4 text-sm tracking-widest font-semibold transition-all"
            :disabled="placingOrder || lines.length === 0"
          >
            <span v-if="placingOrder">Placing Order...</span>
            <span v-else>Complete Order (Cash on Delivery) — {{ formatPrice(total) }}</span>
          </button>
        </form>

        <!-- Order Summary (Sticky on scroll) -->
        <div class="sticky top-24 border border-line rounded-2xl p-6 h-fit bg-white/30 backdrop-blur-sm shadow-sm">
          <h2 class="font-serif text-xl mb-6">Order Summary</h2>

          <div v-if="lines.length === 0" class="text-sm text-ink/50 py-4 text-center">Your bag is empty.</div>
          <div v-else class="space-y-4 mb-6">
            <div v-for="line in lines" :key="line.key" class="flex gap-3">
              <div class="w-14 h-16 bg-line/30 rounded-lg shrink-0 overflow-hidden">
                <img :src="line.image" :alt="line.title" class="h-full w-full object-cover" />
              </div>
              <div class="flex-1 flex items-start justify-between text-sm">
                <div>
                  <p class="font-medium">{{ line.title }}</p>
                  <p class="text-ink/50 text-xs">{{ line.variant.title }} &times; {{ line.quantity }}</p>
                </div>
                <p class="font-medium text-xs font-mono">{{ formatPrice(line.variant.price * line.quantity) }}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-line pt-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-ink/60">Subtotal</span>
              <span class="font-mono text-xs">{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-ink/60">Shipping</span>
              <span class="text-xs uppercase tracking-wider text-emerald-700 font-medium">Free</span>
            </div>
            <div class="flex justify-between text-base font-medium pt-3 border-t border-line/60">
              <span>Total Amount</span>
              <span class="font-mono text-base font-semibold">{{ formatPrice(total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
</style>
