<script setup lang="ts">
const page = computed(() => usePage('about'))
</script>

<template>
  <div>
    <section class="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-ink">
      <img :src="page.image" :alt="page.title" class="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div class="absolute inset-0 bg-ink/40" />
      <div class="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <p class="eyebrow text-cream/80 mb-4">About UA SCENTS</p>
        <h1 class="font-serif text-cream text-4xl md:text-6xl">{{ page.title }}</h1>
      </div>
    </section>

    <section class="container-lore py-20 max-w-3xl mx-auto text-center">
      <p class="text-xl md:text-2xl font-serif leading-relaxed">{{ page.description }}</p>
    </section>

    <section class="container-lore pb-24 grid md:grid-cols-3 gap-6">
      <div class="aspect-[3/4] overflow-hidden bg-line/30">
        <img src="/images/Editorial_048872.png" alt="UA SCENTS" class="h-full w-full object-cover" />
      </div>
      <div class="aspect-[3/4] overflow-hidden bg-line/30">
        <img src="/images/Editorial_Bio_0313d4.png" alt="UA SCENTS" class="h-full w-full object-cover" />
      </div>
      <div class="aspect-[3/4] overflow-hidden bg-line/30">
        <img src="/images/secImage.jpeg" alt="UA SCENTS" class="h-full w-full object-cover" />
      </div>
    </section>

    <Newsletter />
  </div>
</template>
