<script setup lang="ts">
const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md font-sans text-xs font-medium text-slate-100 transition-all"
        :class="[
          toast.type === 'success' ? 'bg-[#121c17]/95 border-emerald-500/30 text-emerald-200' :
          toast.type === 'error' ? 'bg-[#211215]/95 border-rose-500/30 text-rose-200' :
          'bg-[#161b26]/95 border-sky-500/30 text-sky-200'
        ]"
      >
        <div class="flex items-center gap-3 min-w-0">
          <!-- Success Icon -->
          <div
            v-if="toast.type === 'success'"
            class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold"
          >
            ✓
          </div>
          <!-- Error Icon -->
          <div
            v-else-if="toast.type === 'error'"
            class="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold"
          >
            ✕
          </div>
          <!-- Info Icon -->
          <div
            v-else
            class="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 font-bold"
          >
            ℹ
          </div>

          <p class="truncate leading-tight text-slate-100">{{ toast.message }}</p>
        </div>

        <button
          type="button"
          class="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded-md hover:bg-white/5 shrink-0"
          @click="removeToast(toast.id)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
