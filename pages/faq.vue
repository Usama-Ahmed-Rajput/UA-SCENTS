<script setup lang="ts">
const page = computed(() => usePage('faq'))
</script>

<template>
  <div class="container-lore py-20 max-w-2xl mx-auto">
    <p class="eyebrow mb-3 text-center">Support</p>
    <h1 class="font-serif text-3xl md:text-5xl text-center mb-16">{{ page.title }}</h1>

    <div>
      <Accordion v-for="item in page.items" :key="item.q" :title="item.q">
        <p>{{ item.a }}</p>
      </Accordion>
    </div>
  </div>
</template>
