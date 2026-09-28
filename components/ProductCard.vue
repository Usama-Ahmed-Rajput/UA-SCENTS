<script setup lang="ts">
import type { Product } from '~/composables/useProducts'

const props = defineProps<{ product: Product }>()

const cheapestVariant = computed(() => {
  if (!props.product.variants || props.product.variants.length === 0) return null
  return props.product.variants.reduce((min, v) => (v.price < min.price ? v : min), props.product.variants[0])
})
</script>

<template>
  <NuxtLink :to="`/products/${product.handle}`" class="group relative block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div class="relative aspect-square overflow-hidden bg-[#ebe5d9] transition-colors duration-500 rounded-2xl">
      <div
        v-if="product.gradient"
        class="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        :style="{ background: product.gradient }"
      />
      <img
        :src="product.image"
        :alt="product.title"
        class="absolute inset-0 h-full w-full object-contain p-6 md:p-10 transition-all duration-500"
        :class="product.image2 ? 'group-hover:opacity-0 group-hover:scale-[1.04]' : 'group-hover:scale-[1.04]'"
      />
      <img
        v-if="product.image2"
        :src="product.image2"
        :alt="`${product.title} alternate`"
        class="absolute inset-0 h-full w-full object-contain p-6 md:p-10 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.04]"
      />
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-end justify-between bg-gradient-to-t from-[#ebe5d9]/90 via-[#ebe5d9]/40 to-transparent pt-10 rounded-b-2xl">
      <div>
        <h3 class="font-serif md:text-lg text-[13px] italic leading-tight text-ink">{{ product.title }}</h3>
      </div>
      <div v-if="cheapestVariant" class="text-right">
        <p class="text-[11px] uppercase tracking-[0.15em] text-ink/60">
          {{ cheapestVariant.title }}
        </p>
        <p class="text-sm font-semibold text-ink">{{ formatPrice(cheapestVariant.price) }}</p>
      </div>
    </div>

    <span
      v-if="product.badge"
      class="absolute top-3 left-3 px-2.5 py-1 bg-ink text-cream text-[10px] uppercase tracking-[0.12em] rounded-full shadow-sm"
    >
      {{ product.badge }}
    </span>
  </NuxtLink>
</template>
