// Single supabase client instance for the entire app
import { createBrowserClient } from '@supabase/ssr'

// Only initialize client on the browser
let supabaseClientInstance: ReturnType<typeof createBrowserClient> | null = null

// Create a singleton pattern for the Supabase client
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Return a dummy client for SSR (it won't actually be used)
    return null
  }
  
  if (!supabaseClientInstance) {
    // Initialize only once
    supabaseClientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    console.log('[Supabase] Created new client instance')
  }
  
  return supabaseClientInstance
}

// For backwards compatibility with existing code
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null
