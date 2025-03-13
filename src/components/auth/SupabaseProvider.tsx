"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react"
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"

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
  isAuthenticated: false,
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
  const safeRedirect = useCallback(
    (path: string) => {
      if (isRedirecting.current) {
        console.log(
          "[SupabaseProvider] Skipping redirect as one is already in progress"
        )
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
    },
    [pathname, router]
  )

  useEffect(() => {
    console.log("[SupabaseProvider] Initializing")

    // Get the Supabase client using our singleton pattern
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.error("[SupabaseProvider] Failed to get Supabase client")
      setIsLoading(false)
      return () => {}
    }

    // Get initial user
    const getUserData = async () => {
      try {
        console.log("[SupabaseProvider] Getting initial user")
        let fetchedUser
        const {
          data: { user: secureUser },
        } = await supabase.auth.getUser()
        if (secureUser) {
          fetchedUser = secureUser
          console.log("[SupabaseProvider] Retrieved user via getUser", {
            userId: secureUser.id,
          })
        } else {
          console.log(
            "[SupabaseProvider] getUser returned null, falling back to getSession"
          )
          const {
            data: { session },
          } = await supabase.auth.getSession()
          fetchedUser = session?.user ?? null
          console.log("[SupabaseProvider] Retrieved user via getSession", {
            userId: fetchedUser?.id,
          })
        }

        setUser(fetchedUser)
        setIsAuthenticated(!!fetchedUser)
        setSession(null)
        setIsLoading(false)

        if (fetchedUser && (pathname === "/" || pathname === "/login")) {
          safeRedirect("/dashboard")
        }
      } catch (error) {
        console.error("[SupabaseProvider] Error getting user:", error)
        setIsLoading(false)
      }
    }
    getUserData()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log("[SupabaseProvider] Auth state changed:", event, {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          currentPath: pathname,
        })

        if (event === "SIGNED_IN") {
          supabase.auth
            .getUser()
            .then(
              async ({
                data: { user: secureUser },
              }: {
                data: { user: User | null }
              }) => {
                let updatedUser: User | null = secureUser
                if (!updatedUser) {
                  console.log(
                    "[SupabaseProvider] getUser returned null on auth change, falling back to getSession"
                  )
                  const {
                    data: { session },
                  } = await supabase.auth.getSession()
                  updatedUser = session?.user ?? null
                }
                console.log("[SupabaseProvider] Updated user after sign in:", {
                  hasUser: !!updatedUser,
                  userId: updatedUser?.id,
                })
                setUser(updatedUser)
                setIsAuthenticated(!!updatedUser)

                if (
                  updatedUser &&
                  (pathname === "/" || pathname === "/login")
                ) {
                  console.log(
                    "[SupabaseProvider] User signed in, redirecting to dashboard"
                  )
                  safeRedirect("/dashboard")
                }
              }
            )
        } else if (event === "SIGNED_OUT") {
          console.log(
            "[SupabaseProvider] User signed out, redirecting to login"
          )
          setUser(null)
          setIsAuthenticated(false)
          safeRedirect("/login")
        }
      }
    )

    return () => {
      console.log("[SupabaseProvider] Cleaning up subscription")
      subscription.unsubscribe()
    }
  }, [pathname, safeRedirect])

  const signOut = async () => {
    console.log("[SupabaseProvider] Signing out user")
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setIsAuthenticated(false)
    setUser(null)
    setSession(null)
    safeRedirect("/login")
  }

  const value = {
    user,
    session,
    signOut,
    isLoading,
    isAuthenticated,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}
