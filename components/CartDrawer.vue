<script setup lang="ts">
const route = useRoute()
const { lines, subtotal, count, drawerOpen, updateQuantity, removeItem } = useCart()

watch(route, () => {
  drawerOpen.value = false
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        @click="drawerOpen = false"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <aside
        v-if="drawerOpen"
        class="fixed inset-y-0 right-0 z-[80] w-full max-w-md bg-black/80 backdrop-blur-sm border-l border-cream/10 flex flex-col text-cream"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-cream/10">
          <h2 class="font-serif text-xl italic">Your Bag</h2>
          <span v-if="count > 0" class="text-xs text-cream/50 tracking-wider uppercase">{{ count }} {{ count === 1 ? 'item' : 'items' }}</span>
          <button
            class="p-1.5 rounded-full border border-cream/20 text-cream/70 hover:text-cream hover:border-cream/40 transition-colors"
            aria-label="Close cart"
            @click="drawerOpen = false"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="lines.length === 0" class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <svg class="w-12 h-12 text-cream/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p class="text-cream/50 text-sm mb-6">Your bag is empty.</p>
          <button
            class="px-6 py-2.5 border border-cream/40 rounded-full text-[11px] tracking-[0.12em] uppercase text-cream hover:bg-cream hover:text-ink transition-colors"
            @click="drawerOpen = false"
          >
            Continue Shopping
          </button>
        </div>

        <!-- Cart items -->
        <div v-else class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div
            v-for="line in lines"
            :key="line.key"
            class="flex gap-4 py-4 border-b border-cream/10 last:border-0"
          >
            <!-- Product image -->
            <NuxtLink
              :to="`/products/${line.handle}`"
              class="w-20 h-24 bg-cream/10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
              @click="drawerOpen = false"
            >
              <img :src="line.image" :alt="line.title" class="h-full w-full object-contain p-2" />
            </NuxtLink>

            <!-- Product info -->
            <div class="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <NuxtLink
                  :to="`/products/${line.handle}`"
                  class="font-serif text-sm italic text-cream hover:text-cream/80 transition-colors truncate block"
                  @click="drawerOpen = false"
                >
                  {{ line.title }}
                </NuxtLink>
                <p class="text-[11px] text-cream/40 mt-0.5">{{ line.variant.title }}</p>
              </div>

              <div class="flex items-center justify-between mt-2">
                <!-- Quantity controls -->
                <div class="flex items-center gap-0 border border-cream/20 rounded-full">
                  <button
                    class="w-7 h-7 flex items-center justify-center text-xs text-cream/70 hover:text-cream transition-colors"
                    @click="updateQuantity(line.key, line.quantity - 1)"
                  >
                    -
                  </button>
                  <span class="w-6 text-center text-xs">{{ line.quantity }}</span>
                  <button
                    class="w-7 h-7 flex items-center justify-center text-xs text-cream/70 hover:text-cream transition-colors"
                    @click="updateQuantity(line.key, line.quantity + 1)"
                  >
                    +
                  </button>
                </div>

                <p class="text-sm">{{ formatPrice(line.variant.price * line.quantity) }}</p>
              </div>
            </div>

            <!-- Remove button -->
            <button
              class="self-start p-1 text-cream/30 hover:text-cream/70 transition-colors"
              aria-label="Remove item"
              @click="removeItem(line.key)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="lines.length > 0" class="border-t border-cream/10 px-6 py-5 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider text-cream/50">Subtotal</span>
            <span class="text-lg">{{ formatPrice(subtotal) }}</span>
          </div>
          <p class="text-[10px] text-cream/30 text-center">Shipping calculated at checkout</p>
          <NuxtLink
            to="/checkout"
            class="block w-full text-center bg-cream text-ink py-3.5 text-[13px] tracking-[0.12em] uppercase rounded-full font-medium hover:bg-white transition-colors"
            @click="drawerOpen = false"
          >
            Checkout
          </NuxtLink>
          <NuxtLink
            to="/cart"
            class="block w-full text-center border border-cream/30 text-cream py-3 text-[11px] tracking-[0.12em] uppercase rounded-full hover:bg-cream/10 transition-colors"
            @click="drawerOpen = false"
          >
            View Bag
          </NuxtLink>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
