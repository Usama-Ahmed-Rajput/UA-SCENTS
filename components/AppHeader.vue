<script setup lang="ts">
const { count } = useCart()
const mobileOpen = ref(false)

const nav = [
  { label: 'Men', to: '/collections/men' },
  { label: 'Women', to: '/collections/women' },
  { label: 'Unisex', to: '/collections/unisex' },
  { label: 'About', to: '/about' }
]
</script>

<template>
  <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-line">
    <div class="container-lore flex items-center justify-between h-20">
      <button class="md:hidden" aria-label="Open menu" @click="mobileOpen = !mobileOpen">
        <span class="block w-6 h-px bg-ink mb-1.5" />
        <span class="block w-6 h-px bg-ink mb-1.5" />
        <span class="block w-6 h-px bg-ink" />
      </button>

      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="text-[13px] tracking-[0.08em] uppercase text-ink/80 hover:text-ink transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <NuxtLink to="/" class="absolute left-1/2 -translate-x-1/2">
        <img src="/logoBlk.png" alt="UA SCENTS" class="h-6 w-auto" />
      </NuxtLink>

      <div class="flex items-center gap-5">
        <NuxtLink to="/cart" class="relative" aria-label="Shopping bag">
          <svg class="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span
            v-if="count > 0"
            class="absolute -top-2 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-cream"
          >
            {{ count }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <div v-if="mobileOpen" class="md:hidden border-t border-line bg-cream">
      <nav class="flex flex-col px-6 py-4 gap-4">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="text-[13px] tracking-[0.08em] uppercase text-ink/80"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
