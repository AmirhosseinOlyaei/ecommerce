'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'

type SupabaseContextType = {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  isLoading: true,
  isAuthenticated: false
})

export const useSupabase = () => useContext(SupabaseContext)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isRedirecting = useRef(false)
  
  // Function to safely redirect (prevent redirect loops)
  const safeRedirect = useCallback((path: string) => {
    if (isRedirecting.current) {
      console.log('[SupabaseProvider] Skipping redirect as one is already in progress')
      return
    }
    
    // Don't redirect if we're already on that path
    if (pathname === path) {
      console.log(`[SupabaseProvider] Already at ${path}, skipping redirect`)
      return
    }
    
    console.log(`[SupabaseProvider] Redirecting to ${path}`)
    isRedirecting.current = true
    
    // Reset after a short delay to prevent rapid successive redirects
    setTimeout(() => {
      isRedirecting.current = false
    }, 2000)
    
    router.push(path)
  }, [pathname, router])

  useEffect(() => {
    console.log('[SupabaseProvider] Initializing')
    
    // Get the Supabase client using our singleton pattern
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.error('[SupabaseProvider] Failed to get Supabase client')
      setIsLoading(false)
      return () => {}
    }
    
    // Get initial session
    const getSession = async () => {
      try {
        console.log('[SupabaseProvider] Getting initial session')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[SupabaseProvider] Initial session result:', { 
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          currentPath: pathname
        })
        
        setSession(session)
        setUser(session?.user ?? null)
        setIsAuthenticated(!!session)
        setIsLoading(false)
        
        // Only redirect to dashboard if we have a session and we're not already there
        // Skip redirect if we're in the auth callback flow
        if (session && pathname !== '/dashboard' && !pathname.includes('/auth/callback')) {
          safeRedirect('/dashboard')
        }
      } catch (error) {
        console.error('[SupabaseProvider] Error getting session:', error)
        setIsLoading(false)
      }
    }

    getSession()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('[SupabaseProvider] Auth state changed:', event, {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        currentPath: pathname
      })
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsAuthenticated(!!session)
      
      // Only redirect on sign-in if not already on dashboard and not in the auth flow
      if (event === 'SIGNED_IN' && pathname !== '/dashboard' && !pathname.includes('/auth')) {
        console.log('[SupabaseProvider] User signed in, redirecting to dashboard')
        safeRedirect('/dashboard')
      } else if (event === 'SIGNED_OUT' && !pathname.includes('/login')) {
        console.log('[SupabaseProvider] User signed out, redirecting to login')
        safeRedirect('/login')
      }
    })

    return () => {
      console.log('[SupabaseProvider] Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [pathname, safeRedirect])

  const signOut = async () => {
    console.log('[SupabaseProvider] Signing out user')
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setIsAuthenticated(false)
    setUser(null)
    setSession(null)
    safeRedirect('/login')
  }

  const value = {
    user,
    session,
    signOut,
    isLoading,
    isAuthenticated
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}
