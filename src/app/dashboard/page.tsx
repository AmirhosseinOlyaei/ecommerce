'use client'

import { useSupabase } from '@/components/auth/SupabaseProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, signOut, isLoading, isAuthenticated } = useSupabase()
  const router = useRouter()

  console.log('[Dashboard] Rendering with state:', { 
    isLoading, 
    isAuthenticated, 
    hasUser: !!user,
    userId: user?.id,
    email: user?.email
  })

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    console.log('[Dashboard] useEffect running with:', { isLoading, isAuthenticated })
    
    if (!isLoading && !isAuthenticated) {
      console.log('[Dashboard] Not authenticated, redirecting to login')
      router.push('/login')
    } else if (!isLoading && isAuthenticated) {
      console.log('[Dashboard] Authenticated user:', { 
        id: user?.id, 
        email: user?.email 
      })
    }
  }, [isLoading, isAuthenticated, router, user])

  // Show loading state
  if (isLoading) {
    console.log('[Dashboard] Showing loading spinner')
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirecting will happen via useEffect)
  if (!isAuthenticated) {
    console.log('[Dashboard] Not authenticated, returning null')
    return null
  }

  console.log('[Dashboard] Rendering dashboard content for user:', user?.email)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => {
            console.log('[Dashboard] Sign out button clicked')
            signOut()
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Last Sign In:</strong> {new Date(user?.last_sign_in_at || '').toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/products" className="block bg-blue-50 hover:bg-blue-100 p-6 rounded-lg shadow transition">
          <h3 className="text-lg font-semibold mb-2">Browse Products</h3>
          <p className="text-gray-600">View our catalog of products</p>
        </Link>
        
        <Link href="/orders" className="block bg-green-50 hover:bg-green-100 p-6 rounded-lg shadow transition">
          <h3 className="text-lg font-semibold mb-2">Your Orders</h3>
          <p className="text-gray-600">View your order history</p>
        </Link>
        
        <Link href="/cart" className="block bg-purple-50 hover:bg-purple-100 p-6 rounded-lg shadow transition">
          <h3 className="text-lg font-semibold mb-2">Shopping Cart</h3>
          <p className="text-gray-600">View items in your cart</p>
        </Link>
      </div>
    </div>
  )
}
