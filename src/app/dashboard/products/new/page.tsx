'use client'

import { useSupabase } from '@/components/auth/SupabaseProvider'
import { ProductForm } from '@/components/dashboard/ProductForm'
import { Button, HomeIcon, ListIcon } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function NewProductPage() {
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
      handleNavigation('/login')
    }
  }, [isLoading, isAuthenticated, handleNavigation])

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
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className='container mx-auto max-w-7xl p-6'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Add New Product
          </h1>
          <div className='flex items-center space-x-4'>
            <Button
              href='/dashboard/products'
              variant='secondary'
              icon={<ListIcon />}
            >
              Back to Products
            </Button>
            <Button href='/dashboard' variant='primary' icon={<HomeIcon />}>
              Dashboard
            </Button>
          </div>
        </div>

        <div className='mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-700'>
          <ProductForm />
        </div>
      </div>
    </div>
  )
}
