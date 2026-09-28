<script setup lang="ts">
defineProps<{ title: string; variant?: 'dark' | 'light' }>()
const open = ref(false)

function onEnter(el: Element) {
  const element = el as HTMLElement
  element.style.height = '0'
  element.offsetHeight // force reflow
  element.style.height = element.scrollHeight + 'px'
}

function onAfterEnter(el: Element) {
  ;(el as HTMLElement).style.height = ''
}

function onLeave(el: Element) {
  const element = el as HTMLElement
  element.style.height = element.scrollHeight + 'px'
  element.offsetHeight // force reflow
  element.style.height = '0'
}

function onAfterLeave(el: Element) {
  ;(el as HTMLElement).style.height = ''
}
</script>

<template>
  <div class="border-b" :class="variant === 'light' ? 'border-cream/20' : 'border-black/20'">
    <button
      class="flex w-full items-center justify-between py-4 text-left text-sm tracking-wide uppercase"
      :class="variant === 'light' ? 'text-cream' : 'text-ink'"
      @click="open = !open"
    >
      {{ title }}
      <span class="text-lg leading-none transition-transform duration-300" :class="open ? 'rotate-45' : 'rotate-0'">+</span>
    </button>
    <Transition
      name="accordion"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div v-show="open" class="overflow-hidden pb-4 text-sm leading-relaxed" :class="variant === 'light' ? 'text-cream/70' : 'text-ink/70'">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  height: 0;
  opacity: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
}
</style>
