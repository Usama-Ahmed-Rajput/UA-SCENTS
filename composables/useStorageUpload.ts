export function useStorageUpload(bucket: string = 'product-images') {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function upload(file: File, folder: string = 'products'): Promise<string | null> {
    uploading.value = true
    progress.value = 10
    error.value = null

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5 MB limit')
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed: PNG, JPG, WEBP, GIF')
      }

      const supabase = useSupabaseClient()
      const ext = file.name.split('.').pop() || 'png'
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      const filename = `${folder}/${Date.now()}_${cleanName}.${ext}`

      progress.value = 40

      let { data, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadErr && (uploadErr.message?.toLowerCase().includes('not found') || uploadErr.message?.toLowerCase().includes('bucket'))) {
        // Attempt to auto-create the bucket if missing
        try {
          await supabase.storage.createBucket(bucket, { public: true })
          const retry = await supabase.storage
            .from(bucket)
            .upload(filename, file, {
              cacheControl: '3600',
              upsert: true
            })
          data = retry.data
          uploadErr = retry.error
        } catch {
          // Ignore auto-create error and proceed to fallback
        }
      }

      if (uploadErr || !data) {
        // Fallback to Data URL so admin image upload never breaks
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            progress.value = 100
            uploading.value = false
            error.value = null
            resolve(e.target?.result as string)
          }
          reader.onerror = () => {
            error.value = uploadErr?.message || 'Upload failed'
            uploading.value = false
            progress.value = 0
            resolve(null)
          }
          reader.readAsDataURL(file)
        })
      }

      progress.value = 80

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      progress.value = 100
      uploading.value = false

      return urlData.publicUrl
    } catch (err: any) {
      error.value = err.message || 'Upload failed'
      uploading.value = false
      progress.value = 0
      return null
    }
  }

  async function remove(publicUrl: string): Promise<boolean> {
    try {
      const supabase = useSupabaseClient()
      // Extract path from public URL
      const pathIndex = publicUrl.indexOf(`/storage/v1/object/public/${bucket}/`)
      if (pathIndex === -1) return false

      const filePath = publicUrl.substring(pathIndex + `/storage/v1/object/public/${bucket}/`.length)
      const { error: removeErr } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (removeErr) throw removeErr
      return true
    } catch {
      return false
    }
  }

  return {
    upload,
    remove,
    uploading,
    progress,
    error
  }
}
