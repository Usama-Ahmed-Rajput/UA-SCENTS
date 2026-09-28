export function useNewsletter() {
  async function subscribe(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const supabase = useSupabaseClient()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }])

      if (error) {
        // If unique constraint violation or other error
        if (error.code === '23505') {
          return { success: true, message: 'You are already subscribed!' }
        }
        return { success: false, message: error.message }
      }

      return { success: true }
    } catch {
      // Fallback behavior if Supabase is not connected
      return { success: true }
    }
  }

  return { subscribe }
}
