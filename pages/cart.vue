<script setup lang="ts">
const { lines, subtotal, updateQuantity, removeItem } = useCart()
</script>

<template>
  <div class="container-lore py-16">
    <h1 class="font-serif text-3xl md:text-4xl my-10">Your Bag</h1>

    <div v-if="lines.length === 0" class="text-center py-24">
      <p class="text-ink/60 mb-6">Your bag is empty.</p>
      <NuxtLink to="/collections/all" class="btn-primary">Continue Shopping</NuxtLink>
    </div>

    <div v-else class="grid md:grid-cols-3 gap-12">
      <div class="md:col-span-2 divide-y divide-line">
        <div v-for="line in lines" :key="line.key" class="flex gap-5 py-6">
          <NuxtLink :to="`/products/${line.handle}`" class="w-24 h-28 bg-line/30 shrink-0 overflow-hidden">
            <img :src="line.image" :alt="line.title" class="h-full w-full object-cover" />
          </NuxtLink>

          <div class="flex flex-1 flex-col justify-between">
            <div class="flex items-start justify-between gap-4">
              <div>
                <NuxtLink :to="`/products/${line.handle}`" class="font-serif text-lg">
                  {{ line.title }}
                </NuxtLink>
                <p class="text-sm text-ink/50 mt-1">{{ line.variant.title }}</p>
              </div>
              <p class="text-sm">{{ formatPrice(line.variant.price * line.quantity) }}</p>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center border border-line">
                <button
                  class="w-9 h-9 text-base"
                  @click="updateQuantity(line.key, line.quantity - 1)"
                >
                  -
                </button>
                <span class="w-9 text-center text-sm">{{ line.quantity }}</span>
                <button
                  class="w-9 h-9 text-base"
                  @click="updateQuantity(line.key, line.quantity + 1)"
                >
                  +
                </button>
              </div>
              <button class="text-xs uppercase tracking-wide text-ink/50 underline" @click="removeItem(line.key)">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="border border-line p-6 h-fit">
        <h2 class="font-serif text-xl mb-6">Order Summary</h2>
        <div class="flex justify-between text-sm mb-3">
          <span class="text-ink/60">Subtotal</span>
          <span>{{ formatPrice(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm mb-6">
          <span class="text-ink/60">Shipping</span>
          <span class="text-ink/60">Calculated at checkout</span>
        </div>
        <div class="flex justify-between text-base font-medium border-t border-line pt-4 mb-6">
          <span>Total</span>
          <span>{{ formatPrice(subtotal) }}</span>
        </div>
        <NuxtLink to="/checkout" class="btn-primary w-full">Checkout</NuxtLink>
      </div>
    </div>
  </div>
</template>
