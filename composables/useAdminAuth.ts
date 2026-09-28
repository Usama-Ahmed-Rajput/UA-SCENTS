/**
 * Admin authentication composable.
 * Wraps Supabase auth with UID-based admin whitelisting.
 */
export function useAdminAuth() {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const config = useRuntimeConfig()

  const ADMIN_UID = config.public.adminUid as string

  /** True when a Supabase session exists AND the user is the whitelisted admin. */
  const isAdmin = computed(() => {
    return !!user.value && user.value.id === ADMIN_UID
  })

  /** True when a session exists but the UID does NOT match the admin. */
  const isUnauthorized = computed(() => {
    return !!user.value && user.value.id !== ADMIN_UID
  })

  /** Sign in with email + password. Returns the user or throws. */
  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Verify the authenticated user is the whitelisted admin
    if (data.user?.id !== ADMIN_UID) {
      await supabase.auth.signOut()
      throw new Error('You are not authorized to access the admin panel.')
    }

    return data.user
  }

  /** Sign out and redirect to the admin login page. */
  async function logout() {
    await supabase.auth.signOut()
    await navigateTo('/admin/login')
  }

  return {
    user,
    isAdmin,
    isUnauthorized,
    login,
    logout,
  }
}
