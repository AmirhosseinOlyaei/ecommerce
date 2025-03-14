"use client"

import { Button } from "@/components/ui/Button"
import { CartItem, useCart } from "@/context/CartContext"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type AddToCartButtonProps = {
  product: {
    id: string
    name: string
    price: unknown // Use unknown instead of any
    image?: string | null
    inventory?: number
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, items } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const isInCart = items.some((item) => item.productId === product.id)
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Reset success message after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showSuccess])

  const handleAddToCart = () => {
    // Check if we have inventory data and if it's sufficient
    if (product.inventory !== undefined && quantity > product.inventory) {
      toast.error(`Sorry, only ${product.inventory} items available`)
      return
    }

    setIsAdding(true)

    try {
      const item: CartItem = {
        productId: product.id,
        name: product.name,
        price: Number(product.price), // Convert to number explicitly
        quantity,
        image: product.image,
      }

      addToCart(item)

      // Show success toast
      toast.success(`${product.name} added to cart`)
      setShowSuccess(true)

      // Reset to initial state
      setTimeout(() => {
        setIsAdding(false)
      }, 500)
    } catch (error) {
      console.error("Adding to cart failed:", error)
      toast.error("Failed to add to cart. Please try again.")
      setIsAdding(false)
    }
  }

  // Disable button if inventory is 0
  const isOutOfStock =
    product.inventory !== undefined && product.inventory === 0

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded max-w-[120px] bg-white dark:bg-gray-800">
          <button
            type="button"
            className="w-10 h-10 leading-10 text-gray-600 transition dark:text-gray-400 hover:opacity-75"
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            disabled={isAdding || isOutOfStock}
          >
            -
          </button>

          <span className="w-10 h-10 leading-10 text-center text-gray-900 dark:text-gray-100">
            {quantity}
          </span>

          <button
            type="button"
            className="w-10 h-10 leading-10 text-gray-600 transition dark:text-gray-400 hover:opacity-75"
            onClick={() => setQuantity(quantity + 1)}
            disabled={
              isAdding ||
              isOutOfStock ||
              (product.inventory !== undefined && quantity >= product.inventory)
            }
          >
            +
          </button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          variant={isAdding ? "success" : "primary"}
          className={`flex-1 ${
            isAdding
              ? "text-green-700 bg-green-100 border-2 border-green-500 dark:bg-green-900 dark:text-green-300"
              : isOutOfStock
              ? "text-gray-500 bg-gray-300 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
              : "text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          }`}
        >
          {isAdding ? (
            <span className="flex justify-center items-center">
              <svg
                className="mr-2 -ml-1 w-4 h-4 animate-spin"
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
              Adding...
            </span>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            "Add to Cart"
          )}
        </Button>
      </div>

      {/* Always show cart status with conditional styling */}
      <div
        className={`flex justify-between items-center p-3 rounded-md border transition-all duration-300 ${
          isInCart || showSuccess
            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
            : cartItemCount > 0
            ? "border-blue-300 bg-blue-50 dark:bg-blue-900/10"
            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
        }`}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`mr-2 ${
              isInCart || showSuccess
                ? "text-green-600 dark:text-green-400"
                : cartItemCount > 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400"
            }`}
          >
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>

          <span
            className={`text-sm ${
              isInCart || showSuccess
                ? "text-green-700 dark:text-green-300"
                : cartItemCount > 0
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {isInCart || showSuccess
              ? `${product.name} is in your cart`
              : cartItemCount > 0
              ? `You have ${cartItemCount} item${
                  cartItemCount !== 1 ? "s" : ""
                } in your cart`
              : "Your cart is empty"}
          </span>
        </div>

        <Link
          href="/cart"
          className={`text-sm font-medium flex items-center ${
            isInCart || showSuccess || cartItemCount > 0
              ? "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          {cartItemCount > 0 ? "View Cart" : "Go to Cart"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-1 w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {showSuccess && (
        <div className="flex justify-between items-center p-3 mt-2 text-sm text-green-800 bg-green-100 rounded-md dark:bg-green-900/30 dark:text-green-200">
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Successfully added to cart!
          </span>
          <div className="flex">
            <Link
              href="/products"
              className="mr-4 text-green-800 underline dark:text-green-200 hover:no-underline"
            >
              Continue Shopping
            </Link>
            <Link
              href="/cart"
              className="font-medium text-green-800 underline dark:text-green-200 hover:no-underline"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
