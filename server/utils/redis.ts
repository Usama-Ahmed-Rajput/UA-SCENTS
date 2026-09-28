import { Redis } from '@upstash/redis'

let redis: Redis | null = null

export function useRedis(): Redis {
  if (!redis) {
    const config = useRuntimeConfig()
    redis = new Redis({
      url: config.upstashRedisRestUrl,
      token: config.upstashRedisRestToken,
    })
  }
  return redis
}
