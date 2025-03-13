"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

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
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

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
    <div className="p-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Store Settings
        </h1>
        <button
          onClick={() => handleNavigation("/dashboard")}
          className="px-4 py-2 text-gray-800 bg-gray-200 rounded transition dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="p-6 max-w-7xl bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Store Information
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="storeName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                id="storeName"
                defaultValue="My E-Commerce Store"
                className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label
                htmlFor="storeEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Contact Email
              </label>
              <input
                type="email"
                name="storeEmail"
                id="storeEmail"
                defaultValue="contact@example.com"
                className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue="USD"
                className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Appearance
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="primaryColor"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Primary Color
              </label>
              <div className="flex items-center mt-1">
                <input
                  type="color"
                  name="primaryColor"
                  id="primaryColor"
                  defaultValue="#3B82F6"
                  className="w-8 h-8 rounded-md border border-gray-300 shadow-sm dark:border-gray-700"
                />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Used for buttons and accents
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() =>
              alert(
                "Settings functionality is not fully implemented in this development version"
              )
            }
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent shadow-sm dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>

        <div className="pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Note: This settings page is a placeholder. Full functionality will
            be implemented in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
