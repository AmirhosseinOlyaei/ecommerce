'use client'

import { useSupabase } from '@/components/auth/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function StoreSettingsPage() {
  const { isLoading, isAuthenticated } = useSupabase()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  // Enhanced navigation function with navigation state
  const handleNavigation = useCallback(
    (path: string) => {
      if (isNavigating) return // Prevent multiple clicks

      setIsNavigating(true)
      console.log(`Navigating to: ${path}`)

      // Use router.push directly for Next.js page transitions
      router.push(path)
    },
    [router, isNavigating]
  )

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state
  if (isLoading || isNavigating) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-gray-900 dark:border-gray-100'></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirecting will happen via useEffect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className='mx-auto max-w-7xl p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
          Store Settings
        </h1>
        <button
          onClick={() => handleNavigation('/dashboard')}
          className='rounded bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        >
          Back to Dashboard
        </button>
      </div>

      <div className='max-w-7xl rounded-lg bg-white p-6 shadow dark:bg-gray-800'>
        <div className='mb-8'>
          <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100'>
            Store Information
          </h2>
          <div className='grid grid-cols-1 gap-6'>
            <div>
              <label
                htmlFor='storeName'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Store Name
              </label>
              <input
                type='text'
                name='storeName'
                id='storeName'
                defaultValue='My E-Commerce Store'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100'
              />
            </div>
            <div>
              <label
                htmlFor='storeEmail'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Contact Email
              </label>
              <input
                type='email'
                name='storeEmail'
                id='storeEmail'
                defaultValue='contact@example.com'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100'
              />
            </div>
            <div>
              <label
                htmlFor='currency'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Currency
              </label>
              <select
                id='currency'
                name='currency'
                defaultValue='USD'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100'
              >
                <option value='USD'>USD ($)</option>
                <option value='EUR'>EUR (€)</option>
                <option value='GBP'>GBP (£)</option>
                <option value='CAD'>CAD ($)</option>
              </select>
            </div>
          </div>
        </div>

        <div className='mb-8'>
          <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100'>
            Appearance
          </h2>
          <div className='grid grid-cols-1 gap-6'>
            <div>
              <label
                htmlFor='primaryColor'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Primary Color
              </label>
              <div className='mt-1 flex items-center'>
                <input
                  type='color'
                  name='primaryColor'
                  id='primaryColor'
                  defaultValue='#3B82F6'
                  className='h-8 w-8 rounded-md border border-gray-300 shadow-sm dark:border-gray-700'
                />
                <span className='ml-2 text-sm text-gray-500 dark:text-gray-400'>
                  Used for buttons and accents
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6 flex justify-end'>
          <button
            type='button'
            onClick={() =>
              alert(
                'Settings functionality is not fully implemented in this development version'
              )
            }
            className='rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-600'
          >
            Save Settings
          </button>
        </div>

        <div className='mt-8 border-t border-gray-200 pt-6 dark:border-gray-700'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Note: This settings page is a placeholder. Full functionality will
            be implemented in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
