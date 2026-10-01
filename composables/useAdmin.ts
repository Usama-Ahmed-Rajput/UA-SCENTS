import { DEFAULT_GRADIENTS } from '~/utils/gradients'
import pagesData from '~/data/pages.json'

export function useAdmin() {
  const supabase = useSupabaseClient()

  // ---------------------------------------------------------------------------
  // CACHE INVALIDATION
  // ---------------------------------------------------------------------------

  /**
   * Flush all product-related cache keys after any mutation.
   * This ensures the storefront always shows fresh data.
   */
  async function flushProductCache() {
    try {
      await $fetch('/api/cache/flush', {
        method: 'POST',
        body: {},  // empty body = flush all products:* and pages:* keys
      })
    } catch (err) {
      console.warn('[admin] Cache flush failed (non-critical):', err)
    }
  }


  // ---------------------------------------------------------------------------
  // PRODUCTS CRUD
  // ---------------------------------------------------------------------------

  async function fetchAllProducts() {
    const { data, error } = await supabase
      .from('products_full')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  async function fetchProduct(id: string) {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        product_notes (*),
        product_genders (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return product
  }

  async function createProduct(payload: {
    handle: string
    category: 'fragrance' | 'object' | 'set'
    title: string
    description: string
    image_url: string
    image_2_url?: string
    image_3_url?: string
    gradient?: string
    badge?: string
    sort_order?: number
    variants: Array<{ title: string; option_label: string; sku: string; price: number }>
    notes: string[]
    gender: string[]
  }) {
    // 1. Insert product
    const { data: product, error: pErr } = await supabase
      .from('products')
      .insert({
        handle: payload.handle,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        image_url: payload.image_url,
        image_2_url: payload.image_2_url || null,
        image_3_url: payload.image_3_url || null,
        gradient: payload.gradient || null,
        badge: payload.badge || null,
        sort_order: payload.sort_order || 0
      })
      .select()
      .single()

    if (pErr || !product) throw pErr

    const productId = product.id

    // 2. Insert variants
    if (payload.variants && payload.variants.length) {
      const variantsToInsert = payload.variants.map((v, i) => ({
        product_id: productId,
        title: v.title,
        option_label: v.option_label || v.title,
        sku: v.sku,
        price: v.price,
        sort_order: i + 1
      }))
      const { error: vErr } = await supabase.from('product_variants').insert(variantsToInsert)
      if (vErr) console.error('Error inserting variants:', vErr)
    }

    // 3. Insert notes
    if (payload.notes && payload.notes.length) {
      const notesToInsert = payload.notes.map((n, i) => ({
        product_id: productId,
        note: n,
        sort_order: i + 1
      }))
      const { error: nErr } = await supabase.from('product_notes').insert(notesToInsert)
      if (nErr) console.error('Error inserting notes:', nErr)
    }

    // 4. Insert genders
    if (payload.gender && payload.gender.length) {
      const gendersToInsert = payload.gender.map((g) => ({
        product_id: productId,
        gender: g
      }))
      const { error: gErr } = await supabase.from('product_genders').insert(gendersToInsert)
      if (gErr) console.error('Error inserting genders:', gErr)
    }

    // Auto-flush Redis cache so storefront updates immediately
    await flushProductCache()
    clearNuxtData('products-hydrate')

    return product
  }

  async function updateProduct(id: string, payload: {
    handle: string
    category: 'fragrance' | 'object' | 'set'
    title: string
    description: string
    image_url: string
    image_2_url?: string
    image_3_url?: string
    gradient?: string
    badge?: string
    sort_order?: number
    variants: Array<{ title: string; option_label: string; sku: string; price: number }>
    notes: string[]
    gender: string[]
  }) {
    // 1. Update product base fields
    const { error: pErr } = await supabase
      .from('products')
      .update({
        handle: payload.handle,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        image_url: payload.image_url,
        image_2_url: payload.image_2_url || null,
        image_3_url: payload.image_3_url || null,
        gradient: payload.gradient || null,
        badge: payload.badge || null,
        sort_order: payload.sort_order || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (pErr) throw pErr

    // 2. Replace variants (delete existing & re-insert)
    await supabase.from('product_variants').delete().eq('product_id', id)
    if (payload.variants && payload.variants.length) {
      const variantsToInsert = payload.variants.map((v, i) => ({
        product_id: id,
        title: v.title,
        option_label: v.option_label || v.title,
        sku: v.sku,
        price: v.price,
        sort_order: i + 1
      }))
      await supabase.from('product_variants').insert(variantsToInsert)
    }

    // 3. Replace notes
    await supabase.from('product_notes').delete().eq('product_id', id)
    if (payload.notes && payload.notes.length) {
      const notesToInsert = payload.notes.map((n, i) => ({
        product_id: id,
        note: n,
        sort_order: i + 1
      }))
      await supabase.from('product_notes').insert(notesToInsert)
    }

    // 4. Replace genders
    await supabase.from('product_genders').delete().eq('product_id', id)
    if (payload.gender && payload.gender.length) {
      const gendersToInsert = payload.gender.map((g) => ({
        product_id: id,
        gender: g
      }))
      await supabase.from('product_genders').insert(gendersToInsert)
    }

    // Auto-flush Redis cache & refresh Nuxt data
    await flushProductCache()
    clearNuxtData('products-hydrate')

    return true
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error

    // Auto-flush Redis cache & refresh Nuxt data
    await flushProductCache()
    clearNuxtData('products-hydrate')

    return true
  }

  // ---------------------------------------------------------------------------
  // ORDERS CRUD
  // ---------------------------------------------------------------------------

  async function fetchAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async function fetchOrderDetails(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async function updateOrderStatus(id: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
    return true
  }

  async function deleteOrder(id: string) {
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw error
    return true
  }

  // ---------------------------------------------------------------------------
  // PAGES & FAQ CRUD
  // ---------------------------------------------------------------------------

  async function seedDefaultPages() {
    const pagesToInsertWithVideo = Object.entries(pagesData).map(([slug, data]: [string, any]) => ({
      slug,
      title: data.title,
      description: data.description || '',
      image: data.image || null,
      video: data.video || null,
      updated_at: new Date().toISOString()
    }))

    let insertedPages: any[] | null = null

    const res1 = await supabase
      .from('pages')
      .upsert(pagesToInsertWithVideo, { onConflict: 'slug' })
      .select()

    if (res1.error) {
      const pagesToInsertWithoutVideo = pagesToInsertWithVideo.map(({ video, ...rest }) => rest)
      const res2 = await supabase
        .from('pages')
        .upsert(pagesToInsertWithoutVideo, { onConflict: 'slug' })
        .select()
      if (res2.error) throw res2.error
      insertedPages = res2.data
    } else {
      insertedPages = res1.data
    }

    const faqPage = (insertedPages || []).find((p: any) => p.slug === 'faq')
    if (faqPage && pagesData.faq && pagesData.faq.items) {
      const faqRows = pagesData.faq.items.map((item: any, i: number) => ({
        page_id: faqPage.id,
        question: item.q,
        answer: item.a,
        sort_order: i + 1
      }))
      await supabase.from('faq_items').delete().eq('page_id', faqPage.id)
      await supabase.from('faq_items').insert(faqRows)
    }

    const { data: updatedList } = await supabase.from('pages').select('*').order('title')
    return updatedList || insertedPages || []
  }

  async function fetchAllPages() {
    try {
      const { data, error } = await supabase.from('pages').select('*').order('title')
      if (error) {
        console.error('Error fetching pages:', error)
      }
      if (data && data.length > 0) {
        return data
      }
      return await seedDefaultPages()
    } catch (err) {
      console.warn('fetchAllPages fallback triggered:', err)
      return Object.entries(pagesData).map(([slug, data]: [string, any]) => ({
        id: slug,
        slug,
        title: data.title,
        description: data.description || '',
        image: data.image || null,
        video: data.video || null
      }))
    }
  }

  async function fetchPageWithDetails(id: string) {
    let page: any = null
    const { data: pageById } = await supabase.from('pages').select('*').eq('id', id).maybeSingle()
    if (pageById) {
      page = pageById
    } else {
      const { data: pageBySlug } = await supabase.from('pages').select('*').eq('slug', id).maybeSingle()
      if (pageBySlug) {
        page = pageBySlug
      }
    }

    if (!page) {
      const defaultP = (pagesData as Record<string, any>)[id]
      if (defaultP) {
        page = {
          id,
          slug: id,
          title: defaultP.title,
          description: defaultP.description || '',
          image: defaultP.image || null,
          video: defaultP.video || null
        }
      } else {
        throw new Error('Page not found')
      }
    }

    let faqItems: any[] = []
    if (page.slug === 'faq') {
      const { data: items } = await supabase
        .from('faq_items')
        .select('*')
        .eq('page_id', page.id)
        .order('sort_order', { ascending: true })
      if (items && items.length > 0) {
        faqItems = items
      } else if (pagesData.faq?.items) {
        faqItems = pagesData.faq.items.map((it: any) => ({ question: it.q, answer: it.a }))
      }
    }

    return { page, faqItems }
  }

  async function updatePage(id: string, payload: { title: string; description: string; image?: string; video?: string }) {
    const updateObjWithVideo = {
      title: payload.title,
      description: payload.description,
      image: payload.image || null,
      video: payload.video || null,
      updated_at: new Date().toISOString()
    }

    const updateObjWithoutVideo = {
      title: payload.title,
      description: payload.description,
      image: payload.image || null,
      updated_at: new Date().toISOString()
    }

    let res = await supabase.from('pages').update(updateObjWithVideo).eq('id', id).select()

    if (res.error && res.error.message?.includes('video')) {
      res = await supabase.from('pages').update(updateObjWithoutVideo).eq('id', id).select()
    }

    if (res.error || !res.data || res.data.length === 0) {
      let res2 = await supabase.from('pages').upsert({ slug: id, ...updateObjWithVideo }, { onConflict: 'slug' }).select()
      if (res2.error && res2.error.message?.includes('video')) {
        res2 = await supabase.from('pages').upsert({ slug: id, ...updateObjWithoutVideo }, { onConflict: 'slug' }).select()
      }
      if (res2.error) throw res2.error
    }

    await flushProductCache()
    return true
  }

  async function saveFaqItems(pageId: string, items: Array<{ id?: string; question: string; answer: string }>) {
    let targetPageId = pageId
    if (!pageId.includes('-') || pageId.length < 20) {
      const { data: p } = await supabase.from('pages').select('id').eq('slug', pageId).maybeSingle()
      if (p) targetPageId = p.id
    }

    await supabase.from('faq_items').delete().eq('page_id', targetPageId)
    if (items.length) {
      const rows = items.map((item, i) => ({
        page_id: targetPageId,
        question: item.question,
        answer: item.answer,
        sort_order: i + 1
      }))
      const { error } = await supabase.from('faq_items').insert(rows)
      if (error) throw error
    }

    await flushProductCache()
    return true
  }

  // ---------------------------------------------------------------------------
  // NEWSLETTER SUBSCRIBERS
  // ---------------------------------------------------------------------------

  async function fetchSubscribers() {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async function deleteSubscriber(id: string) {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
    if (error) throw error
    return true
  }

  // ---------------------------------------------------------------------------
  // GRADIENTS CRUD
  // ---------------------------------------------------------------------------

  async function fetchGradients() {
    try {
      const { data, error } = await supabase.from('gradients').select('*').order('category')
      if (error || !data || data.length === 0) {
        return DEFAULT_GRADIENTS
      }
      return data
    } catch {
      return DEFAULT_GRADIENTS
    }
  }

  async function createGradient(payload: { name: string; css_value: string; category: string }) {
    const { data, error } = await supabase.from('gradients').insert(payload).select().single()
    if (error) throw error
    return data
  }

  async function deleteGradient(id: string) {
    const { error } = await supabase.from('gradients').delete().eq('id', id)
    if (error) throw error
    return true
  }

  async function seedDefaultGradients() {
    const rows = DEFAULT_GRADIENTS.map((g) => ({
      name: g.name,
      css_value: g.css_value,
      category: g.category
    }))
    const { data, error } = await supabase.from('gradients').insert(rows).select()
    if (error) throw error
    return data
  }

  // ---------------------------------------------------------------------------
  // DASHBOARD STATS
  // ---------------------------------------------------------------------------

  async function fetchDashboardStats() {
    const [productsRes, pagesRes, subsRes, gradientsRes, ordersRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('pages').select('id', { count: 'exact', head: true }),
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('gradients').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true })
    ])

    return {
      productsCount: productsRes.count || 0,
      pagesCount: pagesRes.count || 0,
      subscribersCount: subsRes.count || 0,
      gradientsCount: gradientsRes.count || 0,
      ordersCount: ordersRes.count || 0
    }
  }

  return {
    fetchAllProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchAllOrders,
    fetchOrderDetails,
    updateOrderStatus,
    deleteOrder,
    fetchAllPages,
    seedDefaultPages,
    fetchPageWithDetails,
    updatePage,
    saveFaqItems,
    fetchSubscribers,
    deleteSubscriber,
    fetchGradients,
    createGradient,
    deleteGradient,
    seedDefaultGradients,
    fetchDashboardStats,
    flushProductCache
  }
}
