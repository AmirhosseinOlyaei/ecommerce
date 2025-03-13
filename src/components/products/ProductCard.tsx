"use client"

import Image from "next/image"
import Link from "next/link"
import { type Product } from "@prisma/client"

interface ProductCardProps {
  product: Product & {
    images?: { url: string }[]
    category?: { name: string } | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const defaultImageUrl = "https://picsum.photos/200/300"
  const imageUrl = product.images?.[0]?.url || defaultImageUrl
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(product.price))

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
