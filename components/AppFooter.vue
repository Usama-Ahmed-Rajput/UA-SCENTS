<script setup lang="ts">
const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'Men', to: '/collections/men' },
      { label: 'Women', to: '/collections/women' },
      { label: 'Unisex', to: '/collections/unisex' },
      { label: 'Build Your Bundle', to: '/products/build-your-bundle' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'FAQ', to: '/faq' }
    ]
  },
  {
    title: 'Policies',
    links: [
      { label: 'Shipping & Returns', to: '/shipping-returns' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Accessibility', to: '/accessibility' }
    ]
  }
]
</script>

<template>
  <footer class="border-t border-line bg-cream">
    <div class="container-lore py-16">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-10">
        <div class="col-span-2">
          <img src="/logoBlk.png" alt="UA SCENTS" class="h-6 w-auto mb-4" />
          <p class="text-sm text-ink/60 max-w-xs">
            Scents that take you somewhere. Complex, rich and emotional. Familiar but new.
          </p>
        </div>
        <div v-for="col in columns" :key="col.title">
          <h4 class="eyebrow mb-4">{{ col.title }}</h4>
          <ul class="space-y-2.5">
            <li v-for="link in col.links" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-ink/70 hover:text-ink transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-16 pt-6 border-t border-line flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <p class="text-xs text-ink/50">&copy; {{ new Date().getFullYear() }} UA SCENTS. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
