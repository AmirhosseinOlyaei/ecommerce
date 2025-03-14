"use client"

import { Button } from "@/components/ui/Button"
import { CartItem, useCart } from "@/context/CartContext"
import { useState } from "react"

type AddToCartButtonProps = {
  product: {
    id: string
    name: string
    price: unknown // Use unknown instead of any
    image?: string | null
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: Number(product.price), // Convert to number explicitly
      quantity,
      image: product.image,
    }

    addToCart(item)
    setIsAdded(true)

    // Reset added state after 2 seconds
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded max-w-[120px] bg-white dark:bg-gray-800">
        <button
          type="button"
          className="w-10 h-10 leading-10 text-gray-600 transition dark:text-gray-400 hover:opacity-75"
          onClick={() => quantity > 1 && setQuantity(quantity - 1)}
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
        >
          +
        </button>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isAdded}
        variant={isAdded ? "success" : "primary"}
        className={`flex-1 ${
          isAdded
            ? "text-green-700 bg-green-100 border-2 border-green-500 dark:bg-green-900 dark:text-green-300"
            : "text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
        }`}
      >
        {isAdded ? "Added to Cart ✓" : "Add to Cart"}
      </Button>
    </div>
  )
}
