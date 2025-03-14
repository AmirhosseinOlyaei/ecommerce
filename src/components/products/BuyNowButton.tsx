"use client"

import { Button } from "@/components/ui/Button"
import { api } from "@/lib/trpc/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type BuyNowButtonProps = {
  product: {
    id: string
    name: string
    price: unknown
    inventory?: number
  }
}

export function BuyNowButton({ product }: BuyNowButtonProps) {
  const router = useRouter()
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Use the TRPC checkout mutation
  const checkoutMutation = api.order.checkout.useMutation({
    onSuccess: (data) => {
      toast.success("Purchase successful!")

      // Format the total to ensure it's a valid number
      const formattedTotal =
        typeof data.total === "number" && !isNaN(data.total)
          ? data.total.toFixed(2)
          : "0.00"

      // Redirect to success page with properly formatted total
      router.push(
        `/cart/success?orderId=${data.orderId}&total=${formattedTotal}`
      )
    },
    onError: (error) => {
      setIsPurchasing(false)
      toast.error(`Purchase failed: ${error.message}`)
      console.error("Purchase error:", error)
    },
  })

  // Handle immediate purchase
  const handleBuyNow = async () => {
    // Check inventory
    const isOutOfStock =
      product.inventory !== undefined && product.inventory <= 0

    if (isOutOfStock) {
      toast.error(`${product.name} is out of stock.`)
      return
    }

    // Validate price
    const validPrice =
      typeof product.price === "number"
        ? product.price
        : parseFloat(product.price?.toString() || "0")

    if (isNaN(validPrice) || validPrice <= 0) {
      toast.error(`Invalid price for ${product.name}.`)
      return
    }

    setIsPurchasing(true)

    try {
      // Create checkout item directly from the product
      const checkoutItems = [
        {
          productId: product.id,
          quantity: 1,
        },
      ]

      // Call checkout mutation
      checkoutMutation.mutate({
        items: checkoutItems,
      })

      // Show confirmation toast immediately for better UI feedback
      toast.success("Processing your purchase...", {
        duration: 3000,
      })
    } catch (error) {
      console.error("Buy now error:", error)
      setIsPurchasing(false)
      toast.error("Something went wrong. Please try again.")
    }
  }

  // Disable button if inventory is 0
  const isOutOfStock =
    product.inventory !== undefined && product.inventory === 0

  return (
    <div className="space-y-3">
      <Button
        onClick={handleBuyNow}
        disabled={isPurchasing || isOutOfStock}
        // Using the primary variant as base but overriding with high-contrast colors
        variant="primary"
        className={`w-full py-3 font-semibold text-lg ${
          isPurchasing
            ? "opacity-70 cursor-wait"
            : isOutOfStock
            ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 border-gray-400"
            : "bg-green-600 text-white hover:bg-green-700 border-green-700 dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-800 shadow-md hover:shadow-lg transition-all"
        }`}
      >
        {isPurchasing ? (
          <span className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2 -ml-1 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : isOutOfStock ? (
          "Out of Stock"
        ) : (
          <span className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2"
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
            Buy Now
          </span>
        )}
      </Button>

      {/* Checkout process explanation */}
      <div className="p-3 text-sm border border-gray-200 rounded-md bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
          What happens next?
        </h4>
        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
          <li className="flex items-center">
            <svg
              className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            Instant checkout (no shopping cart)
          </li>
          <li className="flex items-center">
            <svg
              className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            Process your order immediately
          </li>
          <li className="flex items-center">
            <svg
              className="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            Receive order confirmation
          </li>
        </ul>
      </div>
    </div>
  )
}
