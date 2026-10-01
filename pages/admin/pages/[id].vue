<script setup lang="ts">
import AdminImageUpload from '~/components/admin/AdminImageUpload.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const route = useRoute()
const router = useRouter()
const { fetchPageWithDetails, updatePage, saveFaqItems } = useAdmin()
const toast = useToast()

const pageId = computed(() => route.params.id as string)
const pageData = ref<any | null>(null)
const faqItems = ref<Array<{ question: string; answer: string }>>([])
const loading = ref(true)
const saving = ref(false)

onMounted(async () => {
  try {
    const res = await fetchPageWithDetails(pageId.value)
    pageData.value = res.page
    faqItems.value = res.faqItems.map((fi: any) => ({ question: fi.question, answer: fi.answer }))
  } catch (err) {
    console.error(err)
    toast.error('Page not found')
    router.push('/admin/pages')
  } finally {
    loading.value = false
  }
})

function addFaqItem() {
  faqItems.value.push({ question: '', answer: '' })
}

function removeFaqItem(index: number) {
  faqItems.value.splice(index, 1)
}

async function handleSave() {
  if (!pageData.value) return
  saving.value = true

  try {
    await updatePage(pageId.value, {
      title: pageData.value.title,
      description: pageData.value.description,
      image: pageData.value.image,
      video: pageData.value.video
    })

    if (pageData.value.slug === 'faq') {
      const cleanFaq = faqItems.value.filter((item) => item.question.trim().length > 0)
      await saveFaqItems(pageId.value, cleanFaq)
    }

    toast.success('Page updated successfully!')
    router.push('/admin/pages')
  } catch (err: any) {
    toast.error(err.message || 'Failed to save page')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="py-24 text-center text-xs font-mono text-slate-500">
      Loading page content...
    </div>

    <form v-else-if="pageData" class="space-y-8" @submit.prevent="handleSave">
      <!-- Action Bar -->
      <div class="flex items-center justify-between border-b border-[#272736] pb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-100">Edit Page: /{{ pageData.slug }}</h1>
          <p class="text-xs text-slate-400">Update page title, main content, background video and hero graphics</p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/admin/pages"
            class="px-4 py-2 bg-[#20202d] text-slate-300 text-xs font-medium rounded-lg border border-[#323245]"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            class="px-5 py-2 bg-[#e5e7eb] hover:bg-[#d4b58a] text-ink font-semibold text-xs rounded-lg shadow-sm transition-colors"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save Page' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Info -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-5">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Page Content</h3>

            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Page Title <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="pageData.title"
                type="text"
                required
                class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              />
            </div>

            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Description / Body Content
              </label>
              <textarea
                v-model="pageData.description"
                rows="6"
                class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg p-3.5 text-sm text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              />
            </div>
          </div>

          <!-- FAQ Items Section if slug=faq -->
          <div v-if="pageData.slug === 'faq'" class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-5">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">
                FAQ Accordion Items
              </h3>
              <button
                type="button"
                class="text-xs text-[#e5e7eb] font-medium hover:underline"
                @click="addFaqItem"
              >
                + Add FAQ Question
              </button>
            </div>

            <div v-if="faqItems.length === 0" class="text-xs text-slate-500 font-mono text-center py-6">
              No FAQ items added yet. Click above to add one.
            </div>

            <div class="space-y-4">
              <div
                v-for="(item, idx) in faqItems"
                :key="idx"
                class="bg-[#0f0f14] border border-[#272736] p-4 rounded-xl space-y-3 relative group"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono text-slate-400">Question #{{ idx + 1 }}</span>
                  <button
                    type="button"
                    class="text-slate-500 hover:text-rose-400 text-xs px-2"
                    @click="removeFaqItem(idx)"
                  >
                    Remove
                  </button>
                </div>

                <input
                  v-model="item.question"
                  type="text"
                  placeholder="Question text..."
                  class="w-full bg-[#16161e] border border-[#323245] rounded-lg px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none"
                />

                <textarea
                  v-model="item.answer"
                  rows="2"
                  placeholder="Answer explanation..."
                  class="w-full bg-[#16161e] border border-[#323245] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Options (Hero Image & Video) -->
        <div class="space-y-6">
          <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Hero / Header Image</h3>
            <AdminImageUpload
              v-model="pageData.image"
              label="Page Image"
              folder="pages"
            />
          </div>

          <div class="bg-[#16161e] border border-[#272736] rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#e5e7eb]">Background Video URL</h3>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Video Path / URL (.mp4)
              </label>
              <input
                v-model="pageData.video"
                type="text"
                placeholder="/images/UA SCENTS_BG.mp4 or https://..."
                class="w-full bg-[#0f0f14] border border-[#323245] rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#e5e7eb]"
              />
              <p class="text-[11px] text-slate-500 mt-1.5 leading-normal">
                Specify video path (e.g. <code>/images/UA SCENTS_BG.mp4</code>) or video URL to use as hero background.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
