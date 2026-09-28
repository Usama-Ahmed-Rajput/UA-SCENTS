export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Page slug is required' })
  }

  const supabase = useServerSupabase()

  const pageData = await cacheGet(
    CACHE_KEYS.PAGE_SINGLE(slug),
    CACHE_TTL.PAGES,
    async () => {
      const { data: page, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !page) return null

      let items: Array<{ q: string; a: string }> | undefined = undefined
      if (slug === 'faq') {
        const { data: faqItems } = await supabase
          .from('faq_items')
          .select('question, answer')
          .eq('page_id', page.id)
          .order('sort_order', { ascending: true })

        if (faqItems) {
          items = faqItems.map((fi: any) => ({ q: fi.question, a: fi.answer }))
        }
      }

      return {
        title: page.title,
        description: page.description,
        image: page.image || undefined,
        items: items,
      }
    }
  )

  if (!pageData) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }

  return pageData
})
