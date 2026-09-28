<script setup lang="ts">
import AdminProductForm from '~/components/admin/AdminProductForm.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const route = useRoute()
const router = useRouter()
const { fetchProduct, updateProduct } = useAdmin()

const productId = computed(() => route.params.id as string)
const productData = ref<any | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const raw = await fetchProduct(productId.value)
    // Transform relations for form
    productData.value = {
      ...raw,
      variants: raw.product_variants || [],
      notes: raw.product_notes?.map((n: any) => n.note) || [],
      gender: raw.product_genders?.map((g: any) => g.gender) || []
    }
  } catch (err) {
    console.error(err)
    alert('Product not found')
    router.push('/admin/products')
  } finally {
    loading.value = false
  }
})

async function handleSave(payload: any) {
  try {
    await updateProduct(productId.value, payload)
    router.push('/admin/products')
  } catch (err: any) {
    alert(err.message || 'Failed to update product')
  }
}

function handleCancel() {
  router.push('/admin/products')
}
</script>

<template>
  <div>
    <div v-if="loading" class="py-24 text-center text-xs font-mono text-slate-500">
      Loading product data...
    </div>

    <AdminProductForm
      v-else-if="productData"
      :initial-data="productData"
      :is-editing="true"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>
