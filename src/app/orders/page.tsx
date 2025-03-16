"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import { api } from "@/lib/trpc/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Define types for the order data
type OrderItem = {
  id: string
  name: string
  price: number | string
  quantity: number
}

type Order = {
  id: string
  createdAt: string | Date
  updatedAt?: string | Date
  userId: string
  total: number | string
  status: string
  paymentStatus?: string
  shippingAddress?: string
  orderItems: OrderItem[]
}

// Define a Decimal type to match Prisma's Decimal
type Decimal = {
  toNumber: () => number
}

// Add a type for API-returned orders which have 'items' instead of 'orderItems'
type ApiOrder = {
  id: string
  createdAt: string | Date
  updatedAt?: string | Date | null
  userId: string
  total: number | string | Decimal
  status: string
  paymentStatus?: string | null
  shippingAddress?: string | null
  items: Array<{
    id: string
    quantity: number
    price: number | string | Decimal
    name?: string
    product: {
      name: string
      id: string
      description: string | null
      price: number | string | Decimal
      image: string | null
      sku: string
      inventory: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }
  }>
}

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

// Component to render a single order
const OrderCard = ({ order }: { order: Order | ApiOrder }) => {
  // Check if we're dealing with an ApiOrder (has items) or a regular Order (has orderItems)
  const orderItems =
    "items" in order
      ? order.items.map((item) => ({
          id: item.id,
          name: item.name || item.product.name,
          price:
            typeof item.price === "object" && "toNumber" in item.price
              ? item.price.toNumber()
              : item.price ||
                (typeof item.product.price === "object" &&
                "toNumber" in item.product.price
                  ? item.product.price.toNumber()
                  : item.product.price),
          quantity: item.quantity,
        }))
      : order.orderItems

  // Handle total which might be a Decimal object
  const totalAmount =
    typeof order.total === "object" && "toNumber" in order.total
      ? order.total.toNumber()
      : Number(order.total)

  return (
    <div
      key={order.id}
      className="p-6 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex flex-col items-start justify-between mb-4 md:flex-row md:items-center">
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
          {orderItems?.map(
            (item: {
              id: string
              name: string
              price: number | string
              quantity: number
            }) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
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

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Total
        </span>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          ${totalAmount.toFixed(2)}
        </span>
      </div>
    </div>
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

  // Filter out ALL mock orders (those with IDs starting with "order-")
  const orders = (ordersData?.items || []).filter(
    (order) => !order.id.startsWith("order-")
  )

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
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl text-gray-900 dark:text-gray-100">
            Please sign in to view your orders
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            You need to be logged in to access your order history.
          </p>
          <Link
            href="/login?redirect=/orders"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-md dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300"
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
        <div className="flex items-center justify-center p-12">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin dark:border-blue-400"></div>
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
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl text-gray-900 dark:text-gray-100">
            You haven&apos;t placed any orders yet
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Browse our products and place an order to see your order history.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-md dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300"
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
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-md dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
