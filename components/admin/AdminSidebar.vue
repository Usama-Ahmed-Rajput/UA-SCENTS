<script setup lang="ts">
const route = useRoute()
const { flushProductCache } = useAdmin()
const { logout } = useAdminAuth()
const isOpen = defineModel<boolean>('open', { default: false })

watch(route, () => {
  isOpen.value = false
})

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Orders', to: '/admin/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { label: 'Products', to: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Pages & Content', to: '/admin/pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Subscribers', to: '/admin/subscribers', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'Gradients', to: '/admin/gradients', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' }
]

function isActive(to: string) {
  if (to === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(to)
}

// Cache flush state
const showFlushModal = ref(false)
const isFlushing = ref(false)
const flushResult = ref<string | null>(null)

async function handleFlushCache() {
  isFlushing.value = true
  flushResult.value = null
  try {
    await flushProductCache()
    flushResult.value = 'success'
    setTimeout(() => {
      showFlushModal.value = false
      flushResult.value = null
    }, 1500)
  } catch (err) {
    flushResult.value = 'error'
  } finally {
    isFlushing.value = false
  }
}
</script>

<template>
  <!-- Mobile backdrop -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm md:hidden"
        @click="isOpen = false"
      />
    </Transition>
  </Teleport>

  <aside
    class="fixed inset-y-0 left-0 z-[95] w-64 bg-[#16161e] border-r border-[#272736] flex flex-col justify-between shrink-0 min-h-screen text-slate-300 transition-transform duration-300 md:sticky md:top-0 md:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div>
      <!-- Header / Logo -->
      <div class="px-6 py-6 border-b border-[#272736] flex items-center justify-between">
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <img src="/logoWht.png" alt="UA SCENTS" class="h-5 w-auto" />
          <span class="text-xs uppercase tracking-[0.2em] font-mono text-[#e5e7eb] bg-[#e5e7eb]/10 px-2 py-0.5 rounded">
            Admin
          </span>
        </NuxtLink>
        <button class="md:hidden p-1 text-slate-400 hover:text-white" @click="isOpen = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="p-4 space-y-1.5">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          :class="[
            isActive(item.to)
              ? 'bg-[#e5e7eb] text-ink font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-100 hover:bg-[#20202d]'
          ]"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-[#272736] space-y-2">
      <!-- Flush Cache Button -->
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-amber-500/30 text-xs uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
        @click="showFlushModal = true"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Flush Cache</span>
      </button>

      <!-- Sign Out -->
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-rose-500/20 text-xs uppercase tracking-wider text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        @click="logout"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Sign Out</span>
      </button>

      <!-- Back to Store -->
      <NuxtLink
        to="/"
        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#323245] text-xs uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#20202d] transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Store</span>
      </NuxtLink>
    </div>

    <!-- Flush Cache Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showFlushModal" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-[#16161e] border border-[#272736] rounded-2xl max-w-md w-full p-6 space-y-5">
          <!-- Success state -->
          <template v-if="flushResult === 'success'">
            <div class="text-center py-4">
              <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-100">Cache Flushed</h3>
              <p class="text-xs text-slate-400 mt-1">All cached data has been cleared successfully.</p>
            </div>
          </template>

          <!-- Error state -->
          <template v-else-if="flushResult === 'error'">
            <div class="text-center py-4">
              <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <svg class="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-100">Flush Failed</h3>
              <p class="text-xs text-slate-400 mt-1">Something went wrong. Please try again.</p>
            </div>
            <div class="flex justify-center pt-2">
              <button
                type="button"
                class="px-5 py-2 bg-[#20202d] text-slate-300 text-xs rounded-lg"
                @click="showFlushModal = false; flushResult = null"
              >
                Close
              </button>
            </div>
          </template>

          <!-- Confirmation state -->
          <template v-else>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-100">Flush Cache</h3>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                  This will clear all cached product and page data. The next visitor will trigger a fresh fetch from the database. This is safe but may briefly slow down the first load.
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                class="px-4 py-2 bg-[#20202d] text-slate-300 text-xs rounded-lg hover:bg-[#2a2a3d] transition-colors"
                @click="showFlushModal = false"
                :disabled="isFlushing"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
                :disabled="isFlushing"
                @click="handleFlushCache"
              >
                <svg v-if="isFlushing" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{{ isFlushing ? 'Flushing...' : 'Confirm Flush' }}</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
