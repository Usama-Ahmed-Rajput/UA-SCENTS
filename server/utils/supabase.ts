import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

/**
 * Server-side Supabase client (uses runtimeConfig, never exposed to browser).
 */
export function useServerSupabase(): SupabaseClient {
  if (!supabase) {
    const config = useRuntimeConfig()
    supabase = createClient(config.supabaseUrl, config.supabaseKey)
  }
  return supabase
}
