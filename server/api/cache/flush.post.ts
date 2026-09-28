export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const keys: string[] | undefined = body?.keys

  const result = await cacheFlush(keys)

  return {
    success: true,
    message: result.flushed.length > 0
      ? `Flushed ${result.flushed.length} cache key(s)`
      : 'No cache keys found to flush',
    flushed: result.flushed,
  }
})
