"use client"

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
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded max-w-[120px] bg-white dark:bg-gray-800">
        <button
          type="button"
          className="w-10 h-10 leading-10 text-gray-600 dark:text-gray-400 transition hover:opacity-75"
          onClick={() => quantity > 1 && setQuantity(quantity - 1)}
        >
          -
        </button>

        <span className="w-10 h-10 leading-10 text-center text-gray-900 dark:text-gray-100">
          {quantity}
        </span>

        <button
          type="button"
          className="w-10 h-10 leading-10 text-gray-600 dark:text-gray-400 transition hover:opacity-75"
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdded}
        className={`flex-1 px-6 py-3 rounded text-sm font-medium transition ${
          isAdded
            ? "bg-green-100 dark:bg-green-900 border-2 border-green-500 text-green-700 dark:text-green-300"
            : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
        }`}
      >
        {isAdded ? "Added to Cart ✓" : "Add to Cart"}
      </button>
    </div>
  )
}
