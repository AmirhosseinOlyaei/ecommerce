"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import { api } from "@/lib/trpc/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Order status badge component
const OrderStatusBadge = ({ status }: { status: string }) => {
  const getStatusColors = () => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "PROCESSING":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColors()}`}
    >
      {status}
    </span>
  )
}

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { isLoading: isAuthLoading, isAuthenticated } = useSupabase()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/orders")
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Fetch orders - now safe for both authenticated and unauthenticated users
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error,
  } = api.order.getMyOrders.useQuery(undefined, {
    // We can always enable the query now since the backend handles unauthenticated users
    // by returning an empty orders list instead of throwing an error
    onError: (error) => {
      console.error("Error fetching orders:", error)
    },
  })
  const orders = ordersData?.items || []

  // Update loading state
  useEffect(() => {
    if (!isAuthLoading && (!isLoadingOrders || error)) {
      setIsLoading(false)
    }
  }, [isAuthLoading, isLoadingOrders, error])

  // Show login message if not authenticated
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Orders
        </h1>
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl text-gray-900 dark:text-gray-100">
            Please sign in to view your orders
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            You need to be logged in to access your order history.
          </p>
          <Link
            href="/login?redirect=/orders"
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md transition-colors dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin dark:border-blue-400"></div>
        </div>
      </div>
    )
  }

  // Empty orders state
  if (orders.length === 0) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Orders
        </h1>
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl text-gray-900 dark:text-gray-100">
            You haven&apos;t placed any orders yet
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Browse our products and place an order to see your order history.
          </p>
          <Link
            href="/products"
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md transition-colors dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300"
          >
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  // Display orders
  return (
    <div className="p-6 mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        My Orders
      </h1>

      <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-6 mb-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex flex-col justify-between items-start mb-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Order #{order.id.substring(order.id.length - 8)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {order.orderItems?.map(
                  (item: {
                    id: string
                    name: string
                    price: number | string
                    quantity: number
                  }) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} × $
                            {Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/products"
          className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md transition-colors dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
