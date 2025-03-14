"use client"

import { Button } from "@/components/ui/Button"
import { useCart } from "@/context/CartContext"
import { api } from "@/lib/trpc/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type AddToCartButtonProps = {
  product: {
    id: string
    name: string
    price: unknown
    inventory?: number
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, items } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const isInCart = items.some((item) => item.productId === product.id)

  // Query to get the latest product inventory
  const { data: currentProduct } = api.product.getById.useQuery(
    { id: product.id },
    {
      enabled: !!product.id,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true, // Refetch when user focuses the window
    }
  )

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
    // First check displayed inventory from component props
    if (product.inventory !== undefined && quantity > product.inventory) {
      toast.error(`Sorry, only ${product.inventory} items available`)
      return
    }

    // Then double-check with latest inventory from the database
    if (currentProduct && currentProduct.inventory < quantity) {
      toast.error(`Sorry, only ${currentProduct.inventory} items available now`)
      return
    }

    setIsAdding(true)

    // Create a normalized price
    let validPrice: number
    if (typeof product.price === "number") {
      validPrice = product.price
    } else if (
      typeof product.price === "object" &&
      product.price !== null &&
      "toNumber" in product.price &&
      typeof product.price.toNumber === "function"
    ) {
      validPrice = product.price.toNumber()
    } else {
      validPrice = parseFloat(String(product.price))
    }

    if (isNaN(validPrice) || validPrice <= 0) {
      toast.error(`Invalid price for ${product.name}.`)
      setIsAdding(false)
      return
    }

    try {
      addToCart({
        productId: product.id,
        name: product.name,
        price: validPrice,
        quantity,
      })

      setShowSuccess(true)
      toast.success(`${product.name} added to cart!`)
    } catch (error) {
      toast.error("Failed to add product to cart")
      console.error("Add to cart error:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex mb-4 space-x-2">
        <div className="relative flex flex-row border rounded-md w-28">
          <button
            type="button"
            className="flex items-center justify-center w-8 text-gray-900 bg-gray-100 rounded-l-md dark:bg-gray-700 dark:text-gray-300"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isAdding}
          >
            -
          </button>
          <span className="flex items-center justify-center w-12 text-sm font-medium text-gray-900 dark:text-gray-300">
            {quantity}
          </span>
          <button
            type="button"
            className="flex items-center justify-center w-8 text-gray-900 bg-gray-100 rounded-r-md dark:bg-gray-700 dark:text-gray-300"
            onClick={() => {
              // Check inventory limits when increasing quantity
              const inventoryToCheck =
                currentProduct?.inventory ?? product.inventory
              if (
                inventoryToCheck !== undefined &&
                quantity >= inventoryToCheck
              ) {
                toast.error(`Sorry, only ${inventoryToCheck} items available`)
                return
              }
              setQuantity(quantity + 1)
            }}
            disabled={isAdding}
          >
            +
          </button>
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={
          isAdding ||
          (product.inventory !== undefined && product.inventory <= 0) ||
          (currentProduct?.inventory !== undefined &&
            currentProduct.inventory <= 0)
        }
        className="w-full font-medium text-base py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-800"
        variant="primary"
      >
        {isAdding ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin dark:border-gray-800"></div>
            <span>Adding...</span>
          </div>
        ) : isInCart ? (
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add More to Cart
          </span>
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart
          </span>
        )}
      </Button>

      {showSuccess && (
        <div className="p-2 mt-2 text-sm font-medium text-center text-green-600 bg-green-100 rounded-md dark:bg-green-900 dark:text-green-300">
          Added to cart successfully!
        </div>
      )}
    </div>
  )
}
