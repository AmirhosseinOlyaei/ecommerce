import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { cache } from 'react'

export const createServerSupabaseClient = cache((req: NextRequest) => {
  const cookieStore = req.cookies
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
})

export async function getSession(req: NextRequest) {
  const supabase = createServerSupabaseClient(req)
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function getUser(req: NextRequest) {
  const session = await getSession(req)
  return session?.user || null
}
