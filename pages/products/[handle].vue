<script setup lang="ts">
import type { Product } from '~/composables/useProducts'

const route = useRoute()
const handle = computed(() => route.params.handle as string)

// Fetch this specific product
const { data: product } = await useAsyncData<Product>(
  `product-${handle.value}`,
  () => $fetch<Product>(`/api/products/${handle.value}`),
  { watch: [handle] }
)

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

const products = useProducts()

const selectedVariant = ref(product.value.variants[0])
const quantity = ref(1)
const { addItem } = useCart()
const added = ref(false)

// Infinite Carousel State
const activeImageIndex = ref(0)
let timer: any = null

const productImages = computed(() => {
  if (!product.value) return []
  if (product.value.images && product.value.images.length) return product.value.images.filter(Boolean) as string[]
  return [product.value.image, product.value.image2, product.value.image3].filter(Boolean) as string[]
})

function nextImage() {
  if (!productImages.value.length) return
  activeImageIndex.value = (activeImageIndex.value + 1) % productImages.value.length
}

function prevImage() {
  if (!productImages.value.length) return
  activeImageIndex.value = (activeImageIndex.value - 1 + productImages.value.length) % productImages.value.length
}

function startTimer() {
  stopTimer()
  if (productImages.value.length > 1) {
    timer = setInterval(() => {
      nextImage()
    }, 3200)
  }
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

watch(handle, () => {
  if (product.value?.variants?.[0]) {
    selectedVariant.value = product.value.variants[0]
  }
  activeImageIndex.value = 0
  startTimer()
})

function handleAddToCart() {
  if (!product.value) return
  addItem(product.value, selectedVariant.value, quantity.value)
  added.value = true
  setTimeout(() => (added.value = false), 2000)
}

const related = computed(() =>
  products.value.filter((p) => p.category === product.value?.category && p.handle !== handle.value).slice(0, 4)
)
</script>

<template>
  <div v-if="product">
    <!-- SEAMLESS SINGLE-COLOR GRADIENT PAGE WRAPPER (NO BORDERS / NO DIVIDER LINES) -->
    <div
      class="relative min-h-screen transition-colors duration-700 text-ink"
      :style="{ background: product.gradient || 'linear-gradient(135deg, #f5ecd8 0%, #e8dcc0 100%)' }"
    >
      <!-- TOP SECTION: 50% / 50% SPLIT (BOTTLE ON LEFT, PRICE & BUY CONTROLS ON RIGHT) -->
      <section class="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <!-- LEFT 50%: BOTTLE IMAGE WITH INFINITE AUTO-SLIDER -->
          <div class="space-y-6 flex flex-col items-center">
            <div
              class="relative aspect-square w-full max-w-lg flex items-center justify-center group overflow-hidden"
              @mouseenter="stopTimer"
              @mouseleave="startTimer"
            >
              <!-- Carousel Fade Transition -->
              <Transition name="carousel-fade" mode="out-in">
                <img
                  :key="activeImageIndex"
                  :src="productImages[activeImageIndex] || product.image"
                  :alt="`${product.title} view ${activeImageIndex + 1}`"
                  class="h-full w-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                />
              </Transition>

              <!-- Left & Right Controls (Visible on hover if multi image) -->
              <div v-if="productImages.length > 1" class="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button
                  type="button"
                  class="w-10 h-10 rounded-full bg-ink/20 hover:bg-ink text-cream backdrop-blur flex items-center justify-center transition-all pointer-events-auto shadow-md"
                  aria-label="Previous Image"
                  @click="prevImage"
                >
                  &#10094;
                </button>
                <button
                  type="button"
                  class="w-10 h-10 rounded-full bg-ink/20 hover:bg-ink text-cream backdrop-blur flex items-center justify-center transition-all pointer-events-auto shadow-md"
                  aria-label="Next Image"
                  @click="nextImage"
                >
                  &#10095;
                </button>
              </div>
            </div>

            <!-- Pagination Dots -->
            <div v-if="productImages.length > 1" class="flex items-center gap-2">
              <button
                v-for="(_, idx) in productImages"
                :key="idx"
                type="button"
                class="h-2 rounded-full transition-all duration-300"
                :class="activeImageIndex === idx ? 'w-6 bg-ink' : 'w-2 bg-ink/30 hover:bg-ink/60'"
                @click="activeImageIndex = idx"
              />
            </div>
          </div>

          <!-- RIGHT 50%: PRICE & BUY CONTROLS (MATCHES SCREENSHOT UI EXACTLY) -->
          <div class="space-y-8 text-center flex flex-col items-center">
            <div class="space-y-2">
              <p class="text-[10px] uppercase tracking-[0.2em] opacity-70 font-semibold">UA SCENTS &bull; {{ product.category }}</p>
              <h1 class="font-serif text-4xl md:text-5xl italic leading-tight">{{ product.title }}</h1>
              <p class="text-3xl font-serif italic pt-2">{{ formatPrice(selectedVariant.price) }}</p>
            </div>

            <!-- SIZE SELECTOR SECTION (EXACT SCREENSHOT UI) -->
            <div v-if="product.variants.length > 0" class="space-y-3 w-full max-w-md">
              <p class="text-[11px] uppercase tracking-[0.25em] opacity-70 font-semibold text-center">SIZE</p>
              <div class="flex gap-4 justify-center">
                <button
                  v-for="variant in product.variants"
                  :key="variant.id"
                  class="px-8 py-3 text-xs uppercase tracking-widest rounded-full transition-all"
                  :class="selectedVariant.id === variant.id ? 'bg-ink text-cream font-semibold shadow-md' : 'border border-ink/40 text-ink hover:bg-ink/10'"
                  @click="selectedVariant = variant"
                >
                  {{ variant.title }}
                </button>
              </div>
            </div>

            <!-- QUANTITY STEPPER (EXACT CIRCULAR SCREENSHOT UI) -->
            <div class="flex items-center justify-center gap-6 py-2">
              <button
                type="button"
                class="w-11 h-11 rounded-full border border-ink/40 flex items-center justify-center text-ink hover:bg-ink/10 transition-colors text-lg font-bold"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                &minus;
              </button>
              <span class="w-8 text-center font-mono text-lg font-semibold">{{ quantity }}</span>
              <button
                type="button"
                class="w-11 h-11 rounded-full border border-ink/40 flex items-center justify-center text-ink hover:bg-ink/10 transition-colors text-lg font-bold"
                @click="quantity++"
              >
                &#43;
              </button>
            </div>

            <!-- ADD TO BAG BUTTON (EXACT SCREENSHOT UI) -->
            <div>
              <button
                class="inline-flex items-center justify-center bg-ink text-cream px-14 py-4 text-xs tracking-[0.18em] uppercase rounded-full font-semibold transition-colors duration-200 hover:bg-black shadow-lg"
                @click="handleAddToCart"
              >
                {{ added ? 'Added to Bag!' : 'ADD TO BAG' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- BOTTOM 50% / 50% SECTION: DESCRIPTION ON LEFT (50%) & FRAGRANCE NOTES ON RIGHT (50%) -->
      <section class="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
          <!-- LEFT 50%: STORY & DESCRIPTION -->
          <div class="space-y-4 text-center md:text-left max-w-lg mx-auto md:mx-0">
            <p class="text-[11px] uppercase tracking-[0.2em] opacity-70 font-semibold">Story &amp; Inspiration</p>
            <p class="font-serif italic text-2xl md:text-3xl leading-relaxed opacity-95">
              &ldquo;{{ product.description }}&rdquo;
            </p>
          </div>

          <!-- RIGHT 50%: FRAGRANCE NOTES LIST -->
          <div v-if="product.notes?.length" class="space-y-4 text-center md:text-left max-w-lg mx-auto md:mx-0">
            <p class="text-[11px] uppercase tracking-[0.2em] opacity-70 font-semibold">Fragrance Notes</p>
            <ul class="space-y-3">
              <li
                v-for="note in product.notes"
                :key="note"
                class="font-serif italic text-2xl md:text-3xl"
              >
                {{ note }}
              </li>
            </ul>
          </div>
        </div>

        <!-- ACCORDIONS (NO LINES) -->
        <div class="mt-16 text-left max-w-2xl mx-auto">
          <Accordion title="Formulation & Ingredients">
            <p>Alcohol Denat., Parfum (Fragrance Oils), Aqua (Water), Benzyl Salicylate, Limonene, Linalool, Coumarin. Vegan &amp; Cruelty-free.</p>
          </Accordion>
          <Accordion title="Shipping & Returns Policy">
            <p>Fast dispatch across Pakistan. Returns accepted within 30 days of receipt provided product remains unopened in original condition.</p>
          </Accordion>
          <Accordion title="SKU Reference">
            <p class="font-mono text-xs">{{ selectedVariant.sku || 'UASCENTS-01' }}</p>
          </Accordion>
        </div>
      </section>

      <!-- YOU MAY ALSO LIKE SECTION (NO DIVIDER LINE) -->
      <section v-if="related.length" class="py-24">
        <div class="container-lore mb-8">
          <h2 class="font-serif text-2xl md:text-3xl italic text-ink">You May Also Like</h2>
        </div>
        <div class="px-3 md:px-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <ProductCard v-for="p in related" :key="p.handle" :product="p" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.carousel-fade-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.carousel-fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
