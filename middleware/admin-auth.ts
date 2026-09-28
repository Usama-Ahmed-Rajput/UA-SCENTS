/**
 * Route middleware that protects all admin pages.
 * Redirects unauthenticated / unauthorized users to /admin/login.
 */
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const config = useRuntimeConfig()

  const ADMIN_UID = config.public.adminUid as string

  // Allow access to the login page itself (avoid redirect loop)
  if (to.path === '/admin/login') return

  // No session → redirect to login
  if (!user.value) {
    return navigateTo('/admin/login')
  }

  // Session exists but wrong user → redirect to login
  if (user.value.id !== ADMIN_UID) {
    return navigateTo('/admin/login')
  }
})
