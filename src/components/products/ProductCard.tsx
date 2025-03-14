"use client"

import { type Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  product: Omit<Product, "price"> & {
    price: number | string | { toString(): string } // Allow different price types
    images?: { url: string }[]
    category?: { name: string } | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  // Generate consistent seed based on product ID
  const productSeed = product.id
    ? parseInt(product.id.replace(/[^0-9]/g, "").slice(0, 3) || "1")
    : Math.floor(Math.random() * 1000)

  const defaultImageUrl = `https://picsum.photos/seed/${productSeed}/800/1000`
  const imageUrl = product.images?.[0]?.url || defaultImageUrl

  // Handle different price types (Decimal, number, string)
  const priceAsNumber =
    typeof product.price === "number"
      ? product.price
      : parseFloat(product.price.toString())

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceAsNumber)

  return (
    <Link
      href={`/products/${product.id}`}
      className="overflow-hidden bg-white rounded-lg border border-gray-200 transition-shadow group dark:border-gray-700 dark:bg-gray-800 hover:shadow-md"
    >
      <div className="overflow-hidden relative bg-gray-100 aspect-square dark:bg-gray-700">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {product.category?.name || "Uncategorized"}
        </div>
        <div className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
          {formattedPrice}
        </div>
      </div>
    </Link>
  )
}
