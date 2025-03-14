"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || "N/A"
  const total = searchParams.get("total") || "0.00"
  const { isAuthenticated } = useSupabase()

  // If not authenticated, redirect to login
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="p-8 space-y-8 w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-12 h-12 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
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
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order Successful!
          </h1>
          <p className="mt-2 text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <div className="py-4 border-t border-b">
          <div className="flex justify-between my-2">
            <span className="font-medium">Order ID:</span>
            <span className="text-gray-600">{orderId}</span>
          </div>
          <div className="flex justify-between my-2">
            <span className="font-medium">Total Amount:</span>
            <span className="text-gray-600">${total}</span>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-gray-600">
            The products you purchased have been removed from the marketplace
            inventory.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email will be sent to your registered email address.
          </p>
        </div>

        <div className="flex flex-col mt-6 space-y-3">
          <Link
            href="/products"
            className="px-4 py-2 text-center text-white bg-purple-600 rounded-md transition duration-200 hover:bg-purple-700"
          >
            Continue Shopping
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-center text-gray-700 bg-white rounded-md border border-gray-300 transition duration-200 hover:bg-gray-50"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
