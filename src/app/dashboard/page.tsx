'use client'

import { useSupabase } from '@/components/auth/SupabaseProvider'
import { Button, ListIcon, TrashIcon } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, signOut, isLoading, isAuthenticated } = useSupabase()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  console.log('[Dashboard] Rendering with state:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
  })

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    console.log('[Dashboard] Running auth check effect')
    // If loading, do nothing yet
    if (isLoading) {
      console.log('[Dashboard] Still loading, not redirecting')
      return
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('[Dashboard] Not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    console.log('[Dashboard] User is authenticated, not redirecting')
  }, [isLoading, isAuthenticated, router, user])

  // Enhanced navigation function with navigation state
  const handleNavigation = useCallback(
    (path: string) => {
      setIsNavigating(true)
      console.log(`Navigating to: ${path}`)
      router.push(path)
    },
    [router]
  )

  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => setIsNavigating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isNavigating])

  console.log('[Dashboard] Rendering dashboard content for user:', user?.email)

  // Show loading state
  if (isLoading || isNavigating) {
    console.log('[Dashboard] Showing loading spinner')
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-gray-900 dark:border-gray-100'></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirecting will happen via useEffect)
  if (!isAuthenticated) {
    console.log('[Dashboard] Not authenticated, returning null')
    return null
  }

  return (
    <div className='mx-auto max-w-7xl p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
          Dashboard
        </h1>
        <div className='flex items-center space-x-4'>
          <Button
            onClick={() => router.push('/products')}
            variant='primary'
            icon={<ListIcon />}
          >
            View Store Front
          </Button>
          <Button
            onClick={() => {
              console.log('[Dashboard] Sign out button clicked')
              signOut()
            }}
            variant='danger'
            icon={<TrashIcon />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className='mb-6 max-w-7xl rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-700'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100'>
          User Profile
        </h2>
        <div className='space-y-2 text-gray-700 dark:text-gray-300'>
          <p>
            <strong className='text-gray-900 dark:text-gray-100'>Email:</strong>{' '}
            {user?.email}
          </p>
          <p>
            <strong className='text-gray-900 dark:text-gray-100'>
              User ID:
            </strong>{' '}
            {user?.id}
          </p>
          <p>
            <strong className='text-gray-900 dark:text-gray-100'>
              Last Sign In:
            </strong>{' '}
            {new Date(user?.last_sign_in_at || '').toLocaleString()}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {/* Product Management Card */}
        <div className='overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800'>
          <div className='p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 rounded-md bg-blue-500 p-3'>
                <svg
                  className='h-6 w-6 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
              </div>
              <div className='ml-5'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                  Products
                </h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  Manage your store products
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <Button
                onClick={() => handleNavigation('/dashboard/products')}
                variant='primary'
                className='w-full'
              >
                View Products
              </Button>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className='overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800'>
          <div className='p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 rounded-md bg-indigo-500 p-3'>
                <svg
                  className='h-6 w-6 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                  />
                </svg>
              </div>
              <div className='ml-5'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                  Orders
                </h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  View and manage customer orders
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <Button
                onClick={() => handleNavigation('/orders')}
                variant='primary'
                className='w-full'
              >
                View Orders
              </Button>
            </div>
          </div>
        </div>

        {/* Store Settings */}
        <div className='overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800'>
          <div className='p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 rounded-md bg-purple-500 p-3'>
                <svg
                  className='h-6 w-6 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                  />
                </svg>
              </div>
              <div className='ml-5'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                  Store Settings
                </h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  Configure your store settings
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <Button
                onClick={() => handleNavigation('/dashboard/settings')}
                variant='primary'
                className='w-full'
              >
                View Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 text-right'></div>
    </div>
  )
}
