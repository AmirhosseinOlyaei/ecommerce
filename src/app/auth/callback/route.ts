import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Auth callback: Starting', {
    hasCode: !!code,
    url: request.url,
    redirectParam: requestUrl.searchParams.get('redirectedFrom'),
  })

  // Get the redirect URL, correctly decode it if needed
  let redirectUrl =
    requestUrl.searchParams.get('redirectedFrom') || '/dashboard'
  try {
    // If the redirectUrl is already encoded, decode it
    if (redirectUrl.includes('%')) {
      redirectUrl = decodeURIComponent(redirectUrl)
    }
    console.log('Auth callback: Redirect target:', redirectUrl)
  } catch (e) {
    console.error('Auth callback: Error decoding redirect URL:', e)
  }

  // Create a response that we'll modify with cookies later
  const response = NextResponse.redirect(new URL(redirectUrl, request.url))

  if (code) {
    try {
      console.log('Auth callback: Exchanging code for session')

      // Create a Supabase client with request/response cookies
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name) {
              const cookie = request.cookies.get(name)
              console.log('Auth callback: Reading cookie', {
                name,
                value: cookie?.value ? '(exists)' : '(not found)',
              })
              return cookie?.value
            },
            set(name, value, options) {
              console.log('Auth callback: Setting cookie', { name, options })
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name, options) {
              console.log('Auth callback: Removing cookie', { name, options })
              response.cookies.set({
                name,
                value: '',
                ...options,
                maxAge: 0,
              })
            },
          },
        }
      )

      // Exchange the code for a session - this sets cookies in the response
      console.log('Auth callback: Calling exchangeCodeForSession')
      const { error, data } = await supabase.auth.exchangeCodeForSession(code)

      console.log('Auth callback: Exchange result', {
        success: !error,
        error: error?.message,
        hasSession: !!data?.session,
        user: data?.session?.user?.email,
      })

      if (error) {
        console.error('Error exchanging code for session:', error.message)
        return NextResponse.redirect(
          new URL(
            '/login?error=' + encodeURIComponent(error.message),
            request.url
          )
        )
      }
    } catch (error) {
      console.error('Exception in auth callback:', error)
      return NextResponse.redirect(
        new URL('/login?error=Authentication%20failed', request.url)
      )
    }
  } else {
    console.log(
      'Auth callback: No code parameter found, this may indicate an invalid authentication attempt'
    )
  }

  console.log('Auth callback: Redirecting to', redirectUrl)

  // Return the response with the updated cookies
  return response
}
