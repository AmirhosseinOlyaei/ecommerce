"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OrderSuccessPage() {
  const router = useRouter()
  const { isAuthenticated } = useSupabase()

  // If not authenticated, redirect to login
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto flex items-center justify-center bg-green-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Order Successful!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Thank you for your order. Your items are now being processed.
        </p>
        <p className="mt-2 text-gray-500">
          (Note: This is a demo application, no actual payment was processed)
        </p>

        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-500">
            A confirmation with details about your order will be emailed to you
            soon.
          </p>

          <div className="pt-4 border-t">
            <h2 className="text-xl font-medium mb-4">Your order has been confirmed!</h2>
            <p className="mb-4">
              Thank you for your purchase. We&apos;ve sent a confirmation email with your order details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
              >
                Continue Shopping
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
