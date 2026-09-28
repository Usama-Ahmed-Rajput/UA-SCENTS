<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-[#0f0f14] text-slate-100 flex font-sans antialiased">
    <AdminSidebar v-model:open="sidebarOpen" />
    <main class="flex-1 min-w-0 overflow-y-auto max-h-screen">
      <!-- Mobile top bar -->
      <div class="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#0f0f14]/90 backdrop-blur border-b border-[#272736] md:hidden">
        <button class="p-1.5 text-slate-300 hover:text-white" @click="sidebarOpen = true">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src="/logoWht.png" alt="UA SCENTS" class="h-4 w-auto" />
      </div>
      <div class="max-w-7xl mx-auto p-6 md:p-10">
        <slot />
      </div>
    </main>
  </div>
</template>
