export default defineEventHandler(async () => {
  const supabase = useServerSupabase()

  const data = await cacheGet(
    CACHE_KEYS.PRODUCTS_ALL,
    CACHE_TTL.PRODUCTS,
    async () => {
      const { data, error } = await supabase
        .from('products_full')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data || []
    }
  )

  // Transform to the shape the frontend expects
  return data.map((item: any) => {
    const imgs = [item.image_url, item.image_2_url, item.image_3_url].filter(Boolean)
    return {
      handle: item.handle,
      category: item.category,
      title: item.title,
      description: item.description,
      image: item.image_url,
      image2: item.image_2_url || undefined,
      image3: item.image_3_url || undefined,
      images: imgs,
      variants: item.variants || [],
      gradient: item.gradient || undefined,
      badge: item.badge || undefined,
      notes: item.notes || [],
      gender: item.gender || [],
    }
  })
})
