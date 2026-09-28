<script setup lang="ts">
definePageMeta({
  layout: false
})

const { login, isAdmin } = useAdminAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

// If already authenticated as admin, redirect to dashboard
watch(isAdmin, (val) => {
  if (val) navigateTo('/admin')
}, { immediate: true })

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    await login(email.value, password.value)
    await navigateTo('/admin')
  } catch (err: any) {
    error.value = err.message || 'Invalid credentials. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 font-sans antialiased relative overflow-hidden">
    <!-- Ambient background glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e5e7eb]/[0.03] rounded-full blur-[120px]" />
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/[0.04] rounded-full blur-[100px]" />
    </div>

    <div class="relative z-10 w-full max-w-[400px]">
      <!-- Logo & Heading -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block mb-6">
          <img src="/logoWht.png" alt="UA SCENTS" class="h-6 w-auto mx-auto opacity-80" />
        </NuxtLink>
        <h1 class="text-xl font-semibold text-slate-100 tracking-tight">Admin Sign In</h1>
        <p class="text-xs text-slate-500 mt-1.5">Enter your credentials to access the store manager</p>
      </div>

      <!-- Login Card -->
      <div class="bg-[#13131a] border border-[#1f1f2e] rounded-2xl p-6 shadow-2xl shadow-black/40">
        <!-- Error Message -->
        <Transition name="slide-fade">
          <div
            v-if="error"
            class="mb-5 flex items-start gap-3 p-3 bg-rose-500/[0.08] border border-rose-500/20 rounded-xl"
          >
            <svg class="w-4 h-4 mt-0.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-xs text-rose-300 leading-relaxed">{{ error }}</p>
          </div>
        </Transition>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Field -->
          <div>
            <label for="admin-email" class="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Email Address
            </label>
            <div class="relative">
              <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="admin-email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="admin@uascents.com"
                class="w-full bg-[#0a0a0f] border border-[#272736] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e5e7eb]/40 focus:ring-1 focus:ring-[#e5e7eb]/10 transition-all"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="admin-password" class="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              Password
            </label>
            <div class="relative">
              <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="admin-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full bg-[#0a0a0f] border border-[#272736] rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e5e7eb]/40 focus:ring-1 focus:ring-[#e5e7eb]/10 transition-all"
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-2 py-2.5 bg-[#e5e7eb] hover:bg-[#d4d6dc] text-[#0a0a0f] font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#e5e7eb]/5"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <NuxtLink to="/" class="text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
          ← Back to Store
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
  transform: translateY(-8px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateY(-4px);
  opacity: 0;
}
</style>
