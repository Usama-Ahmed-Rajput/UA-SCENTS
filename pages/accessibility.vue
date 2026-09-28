<script setup lang="ts">
const page = computed(() => usePage('accessibility'))
</script>

<template>
  <div class="container-lore py-20 max-w-2xl mx-auto">
    <h1 class="font-serif text-3xl md:text-5xl text-center mb-10">{{ page.title }}</h1>
    <p class="text-ink/70 leading-relaxed">{{ page.description }}</p>
  </div>
</template>
