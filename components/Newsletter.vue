<script setup lang="ts">
const email = ref('')
const submitted = ref(false)
const { subscribe } = useNewsletter()

async function submit() {
  if (!email.value) return
  await subscribe(email.value)
  submitted.value = true
}
</script>

<template>
  <section class="bg-ink text-cream">
    <div class="container-lore py-20 text-center">
      <p class="eyebrow text-cream/60 mb-4">Join the World</p>
      <h2 class="font-serif text-3xl md:text-4xl mb-6 max-w-xl mx-auto">
        Be the first to know about new scents & drops.
      </h2>

      <form
        v-if="!submitted"
        class="mx-auto flex max-w-md flex-col sm:flex-row gap-3"
        @submit.prevent="submit"
      >
        <input
          v-model="email"
          type="email"
          required
          placeholder="Email address"
          class="flex-1 bg-transparent border border-cream/30 px-4 py-3 text-sm placeholder:text-cream/50 focus:outline-none focus:border-cream"
        />
        <button type="submit" class="bg-cream text-ink px-6 py-3 text-[13px] tracking-[0.12em] uppercase">
          Subscribe
        </button>
      </form>
      <p v-else class="text-sm text-cream/70">Thank you for joining UA SCENTS.</p>
    </div>
  </section>
</template>
