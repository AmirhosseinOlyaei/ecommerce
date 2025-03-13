'use client'

import { ProductForm } from '@/components/dashboard/ProductForm'
import { useSupabase } from '@/components/auth/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

export default function NewProductPage() {
  const { isLoading, isAuthenticated } = useSupabase()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  // Enhanced navigation function with navigation state
  const handleNavigation = useCallback((path: string) => {
    if (isNavigating) return; // Prevent multiple clicks
    
    setIsNavigating(true);
    console.log(`Navigating to: ${path}`);
    
    // Use router.push directly for Next.js page transitions
    router.push(path);
  }, [router, isNavigating]);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleNavigation('/login');
    }
  }, [isLoading, isAuthenticated, handleNavigation]);

  // Show loading state
  if (isLoading || isNavigating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirecting will happen via useEffect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add New Product</h1>
        <button
          onClick={() => handleNavigation('/dashboard/products')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Back to Products
        </button>
      </div>

      <ProductForm />
    </div>
  )
}
