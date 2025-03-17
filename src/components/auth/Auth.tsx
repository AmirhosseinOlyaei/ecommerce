'use client'

import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

type AuthProps = {
  view: 'sign_in' | 'sign_up' | 'forgotten_password'
  redirectTo?: string
}

export function Auth({ view, redirectTo = '/dashboard' }: AuthProps) {
  console.log('[Auth] Rendering auth component', { view, redirectTo })

  // Get the Supabase client instance
  const supabase = getSupabaseClient()

  // Log when the component mounts
  useEffect(() => {
    console.log('[Auth] Component mounted')
    return () => {
      console.log('[Auth] Component unmounted')
    }
  }, [])

  // Generate the correct callback URL with proper URL encoding for the redirect path
  const callbackUrl = `${
    typeof window !== 'undefined' ? window.location.origin : ''
  }/auth/callback?redirectedFrom=${encodeURIComponent(redirectTo)}`

  console.log('[Auth] Using callback URL:', callbackUrl)

  // Don't render if there's no Supabase client (SSR) or redirectTo is not available
  if (!supabase) {
    console.log(
      '[Auth] No Supabase client available, not rendering auth component'
    )
    return null
  }

  return (
    <div>
      <SupabaseAuth
        supabaseClient={supabase}
        view={view}
        appearance={{ theme: ThemeSupa }}
        theme='light'
        showLinks={true}
        providers={[/* 'google' */]}
        redirectTo={callbackUrl}
        onlyThirdPartyProviders={false}
      />
    </div>
  )
}
