<script setup lang="ts">
import AdminProductForm from '~/components/admin/AdminProductForm.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const router = useRouter()
const { createProduct } = useAdmin()

async function handleSave(payload: any) {
  try {
    await createProduct(payload)
    router.push('/admin/products')
  } catch (err: any) {
    alert(err.message || 'Failed to create product')
  }
}

function handleCancel() {
  router.push('/admin/products')
}
</script>

<template>
  <div>
    <AdminProductForm
      :is-editing="false"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>
