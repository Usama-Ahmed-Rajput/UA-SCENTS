export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')
  if (!handle) {
    throw createError({ statusCode: 400, statusMessage: 'Product handle is required' })
  }

  const supabase = useServerSupabase()

  const product = await cacheGet(
    CACHE_KEYS.PRODUCT_SINGLE(handle),
    CACHE_TTL.PRODUCTS,
    async () => {
      const { data, error } = await supabase
        .from('products_full')
        .select('*')
        .eq('handle', handle)
        .single()

      if (error || !data) return null
      return data
    }
  )

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  // Transform to the shape the frontend expects
  const imgs = [product.image_url, product.image_2_url, product.image_3_url].filter(Boolean)
  return {
    handle: product.handle,
    category: product.category,
    title: product.title,
    description: product.description,
    image: product.image_url,
    image2: product.image_2_url || undefined,
    image3: product.image_3_url || undefined,
    images: imgs,
    variants: product.variants || [],
    gradient: product.gradient || undefined,
    badge: product.badge || undefined,
    notes: product.notes || [],
    gender: product.gender || [],
  }
})
