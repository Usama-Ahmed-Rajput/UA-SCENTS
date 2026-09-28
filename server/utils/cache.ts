// Cache key constants
export const CACHE_KEYS = {
  PRODUCTS_ALL: 'products:all',
  PRODUCT_SINGLE: (handle: string) => `products:${handle}`,
  PAGES_ALL: 'pages:all',
  PAGE_SINGLE: (slug: string) => `pages:${slug}`,
}

// Default TTLs in seconds — 1 week since products rarely change
export const CACHE_TTL = {
  PRODUCTS: 604800,   // 7 days
  PAGES: 604800,      // 7 days
}

/**
 * Cache-aside read helper.
 * Returns cached data if available, otherwise calls fetcher, stores result, and returns it.
 */
export async function cacheGet<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const redis = useRedis()

  try {
    const cached = await redis.get<T>(key)
    if (cached !== null && cached !== undefined) {
      return cached
    }
  } catch (err) {
    // Redis unavailable — fall through to fetcher
    console.warn('[cache] Redis read failed, falling back to direct fetch:', err)
  }

  // Cache miss — fetch from source
  const data = await fetcher()

  // Store in cache (non-blocking, don't let cache write failures break the response)
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttl })
  } catch (err) {
    console.warn('[cache] Redis write failed:', err)
  }

  return data
}

/**
 * Flush specific cache keys or all known product/page keys.
 */
export async function cacheFlush(keys?: string[]): Promise<{ flushed: string[] }> {
  const redis = useRedis()
  const flushed: string[] = []

  if (keys && keys.length > 0) {
    // Flush specific keys
    for (const key of keys) {
      try {
        await redis.del(key)
        flushed.push(key)
      } catch (err) {
        console.warn(`[cache] Failed to delete key ${key}:`, err)
      }
    }
  } else {
    // Flush all known cache keys using scan pattern
    try {
      let cursor: string | number = 0
      do {
        const result = await redis.scan(cursor, { match: 'products:*', count: 100 })
        cursor = result[0]
        const foundKeys = result[1]
        for (const k of foundKeys) {
          await redis.del(k)
          flushed.push(k)
        }
      } while (String(cursor) !== '0')

      // Also flush pages
      cursor = 0
      do {
        const result = await redis.scan(cursor, { match: 'pages:*', count: 100 })
        cursor = result[0]
        const foundKeys = result[1]
        for (const k of foundKeys) {
          await redis.del(k)
          flushed.push(k)
        }
      } while (String(cursor) !== '0')
    } catch (err) {
      console.warn('[cache] Flush scan failed:', err)
    }
  }

  return { flushed }
}
