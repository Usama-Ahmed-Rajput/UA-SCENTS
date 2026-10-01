<script setup lang="ts">
const products = useProducts()
const page = computed(() => usePage('home'))

const fragrances = computed(() => products.value.filter((p) => p.category === 'fragrance').slice(0, 4))

const menFragrances = computed(() =>
  products.value
    .filter((p) => p.category === 'fragrance' && (p.gender?.includes('men') || (!p.gender?.length && p.category === 'fragrance')))
    .slice(0, 4)
)

const womenFragrances = computed(() =>
  products.value
    .filter((p) => p.category === 'fragrance' && p.gender?.includes('women'))
    .slice(0, 4)
)

const sets = computed(() => products.value.filter((p) => p.category !== 'fragrance').slice(0, 3))
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative h-[92vh] min-h-[600px] w-full overflow-hidden bg-ink">
      <video
        :src="page.video || '/images/UA SCENTS_BG.mp4'"
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/50" />

      <div class="relative z-10 flex h-full items-end px-6 md:px-10 py-6 md:py-8">
        <div class="max-w-2xl pb-10">
          <h1 class="font-serif text-cream text-4xl md:text-6xl lg:text-7xl leading-[1.1]">
            {{ page.title || 'Scents that take you somewhere.' }}
          </h1>
        </div>
      </div>
    </section>

    <!-- Intro -->
    <section class="container-lore py-24 text-center">
      <p class="eyebrow mb-6">This is UA SCENTS</p>

      <h2 class="font-serif text-2xl md:text-4xl max-w-3xl mx-auto leading-snug">
        {{ page.description || 'Complex, rich and emotional. Familiar but new. Each scent invites new meaning through your own wear.' }}
      </h2>
      <NuxtLink to="/about" class="inline-block mt-8 text-sm underline underline-offset-4">
        Read our story
      </NuxtLink>
    </section>

    <!-- Fragrances grid -->
    <section class="pb-24">
      <div class="container-lore mb-8">
        <div class="flex items-end justify-between">
          <h2 class="font-serif text-2xl md:text-3xl">The Fragrances</h2>
          <NuxtLink to="/collections/unisex" class="text-sm underline underline-offset-4">
            View all
          </NuxtLink>
        </div>
      </div>
      <div class="px-3 md:px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <ProductCard v-for="p in fragrances" :key="p.handle" :product="p" />
        </div>
      </div>
    </section>

    <!-- Editorial split -->
    <section class="relative min-h-[600px] md:min-h-[700px] flex items-start md:items-center justify-end overflow-hidden">
      <picture class="absolute inset-0 h-full w-full">
        <source media="(min-width: 768px)" :srcset="page.image || '/images/secImage.jpeg'" />
        <img
          :src="page.image || '/images/secImageMob.jpeg'"
          alt="UA SCENTS editorial"
          class="h-full w-full object-cover"
        />
      </picture>
      <div class="absolute inset-0 bg-black/40" />

      <div class="relative z-10 w-full md:w-1/2 flex flex-col items-start md:items-end justify-start md:justify-center px-8 py-16 md:px-16 md:text-right">
        <p class="eyebrow mb-4 text-cream/70">Craftsmanship</p>
        <h2 class="font-serif text-3xl md:text-4xl mb-6 leading-tight text-cream">
          Made with intention, worn with meaning.
        </h2>
        <p class="text-cream/80 mb-8 max-w-md leading-relaxed">
          Every UA SCENTS fragrance is designed inclusive of gender, identity and the things
          we carry — a reminder of all that connects us.
        </p>
        <NuxtLink to="/about" class="btn-outline !border-cream !text-cream hover:!bg-cream hover:!text-ink">
          Discover the story
        </NuxtLink>
      </div>
    </section>

    <!-- Men Section -->
    <section v-if="menFragrances.length" class="py-24">
      <div class="container-lore mb-8">
        <div class="flex items-end justify-between">
          <h2 class="font-serif text-2xl md:text-3xl">Men</h2>
          <NuxtLink to="/collections/men" class="text-sm underline underline-offset-4">
            View all
          </NuxtLink>
        </div>
      </div>
      <div class="px-3 md:px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <ProductCard v-for="p in menFragrances" :key="p.handle" :product="p" />
        </div>
      </div>
    </section>

    <!-- Women Section -->
    <section v-if="womenFragrances.length" class="pb-24">
      <div class="container-lore mb-8">
        <div class="flex items-end justify-between">
          <h2 class="font-serif text-2xl md:text-3xl">Women</h2>
          <NuxtLink to="/collections/women" class="text-sm underline underline-offset-4">
            View all
          </NuxtLink>
        </div>
      </div>
      <div class="px-3 md:px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <ProductCard v-for="p in womenFragrances" :key="p.handle" :product="p" />
        </div>
      </div>
    </section>

    <Newsletter />
  </div>
</template>
