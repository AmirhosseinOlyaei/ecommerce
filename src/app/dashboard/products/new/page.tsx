"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import { ProductForm } from "@/components/dashboard/ProductForm"
import { Button, HomeIcon, ListIcon } from "@/components/ui/Button"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

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
      handleNavigation("/login")
    }
  }, [isLoading, isAuthenticated, handleNavigation])

  // Show loading state
  if (isLoading || isNavigating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-gray-900 animate-spin dark:border-gray-100"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirecting will happen via useEffect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container p-6 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Add New Product
          </h1>
          <div className="flex items-center space-x-4">
            <Button
              href="/dashboard/products"
              variant="secondary"
              icon={<ListIcon />}
            >
              Back to Products
            </Button>
            <Button href="/dashboard" variant="primary" icon={<HomeIcon />}>
              Dashboard
            </Button>
          </div>
        </div>

        <div className="p-6 mb-6 bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
          <ProductForm />
        </div>
      </div>
    </div>
  )
}
