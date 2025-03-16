"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import { useCart } from "@/context/CartContext"
import { api } from "@/lib/trpc/client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function CartPageContent() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal } =
    useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [shippingAddress, setShippingAddress] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAddressInput, setShowAddressInput] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useSupabase()

  const checkoutMutation = api.order.checkout.useMutation({
    onSuccess: (data) => {
      // Clear cart after successful checkout
      clearCart()

      // Show success toast
      toast.success("Purchase successful! Your order has been placed.")

      // Redirect to success page with the subtotal from the cart
      // since the API doesn't return total anymore
      const formattedTotal = subtotal.toFixed(2)

      router.push(
        `/cart/success?orderId=${data.orderId}&total=${formattedTotal}`
      )
    },
    onError: (error) => {
      setIsCheckingOut(false)

      // Handle unauthorized errors specially
      if (
        error.message.includes("sign in") ||
        error.message.includes("UNAUTHORIZED")
      ) {
        // Show a login prompt instead of an error
        toast.error("Please sign in to complete your purchase", {
          action: {
            label: "Sign In",
            onClick: () =>
              router.push(`/login?redirect=${encodeURIComponent("/cart")}`),
          },
          duration: 5000,
        })
      } else {
        // For other errors, show the error message
        toast.error(`Checkout failed: ${error.message}`)
      }

      console.error("Checkout error:", error)
    },
  })

  // Handle checkout with TRPC
  const handleCheckout = async () => {
    // Reset errors
    setErrors({})

    // Basic validation
    if (showAddressInput && !shippingAddress.trim()) {
      setErrors({ address: "Shipping address is required" })
      return
    }

    // Validate cart items and prices
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    // Check for any invalid prices
    const hasInvalidPrices = items.some(
      (item) => isNaN(Number(item.price)) || Number(item.price) <= 0
    )

    if (hasInvalidPrices) {
      toast.error("There are items with invalid prices in your cart")
      return
    }

    setIsCheckingOut(true)

    try {
      // Convert cart items to the format expected by the checkout endpoint
      const checkoutItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))

      // Call the checkout mutation
      checkoutMutation.mutate({
        items: checkoutItems,
        shippingAddress: shippingAddress || undefined,
      })
    } catch (error) {
      console.error("Checkout error:", error)
      setIsCheckingOut(false)
      toast.error("Something went wrong during checkout. Please try again.")
    }
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Your Cart</h1>
        <div className="p-8 text-center bg-white rounded-lg shadow-sm">
          <h2 className="mb-2 text-xl font-medium text-gray-900">
            Your cart is empty
          </h2>
          <p className="mb-6 text-gray-500">
            Looks like you haven&apos;t added any products to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 font-medium text-white transition bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Your Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items - Takes up 2/3 of the width on large screens */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex overflow-hidden bg-white border rounded-lg"
            >
              {/* Product Image */}
              <div className="relative flex-shrink-0 w-24 h-24 bg-gray-100 sm:w-32 sm:h-32">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 96px, 128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col flex-1 p-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    <Link
                      href={`/products/${item.productId}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </h3>
                  <p className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  ${item.price.toFixed(2)} each
                </p>

                <div className="flex items-center justify-between pt-2 mt-auto">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary - Takes up 1/3 of the width on large screens */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Order Summary
            </h2>

            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">$0.00</span>
              </div>
            </div>

            <div className="pt-4 mb-6 border-t">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-xs text-green-600">
                Free shipping - No payment required for MVP
              </p>
            </div>

            {/* Shipping address toggle and input */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="showAddressInput"
                  checked={showAddressInput}
                  onChange={() => setShowAddressInput(!showAddressInput)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="showAddressInput"
                  className="ml-2 text-sm text-gray-600"
                >
                  Add shipping address
                </label>
              </div>

              {showAddressInput && (
                <div className="mt-3">
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your shipping address"
                    className={`w-full p-2 border rounded-md text-sm ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    rows={3}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || items.length === 0}
              className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-300"
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </button>

            {/* Navigation buttons */}
            <div className="flex justify-between gap-2 mt-4">
              <Link
                href="/products"
                className="flex-1 px-4 py-2 text-sm text-center text-purple-600 bg-white border border-purple-600 rounded-md hover:bg-purple-50"
              >
                Continue Shopping
              </Link>
              <Link
                href="/orders"
                className="flex-1 px-4 py-2 text-sm text-center text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                My Orders
              </Link>
            </div>

            {/* Authentication prompt for unauthenticated users */}
            {!checkoutMutation.isLoading && (
              <div className="p-3 mt-4 text-sm rounded-md bg-blue-50">
                <p className="mb-2 font-medium text-blue-800">
                  {isAuthenticated
                    ? "You're signed in and ready to checkout!"
                    : "Sign in to complete your purchase"}
                </p>
                {!isAuthenticated && (
                  <Link
                    href={`/login?redirect=${encodeURIComponent("/cart")}`}
                    className="block w-full px-3 py-2 text-sm text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
