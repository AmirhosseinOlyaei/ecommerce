"use client"

import { type Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "./AddToCartButton"
import { useSupabase } from "@/components/auth/SupabaseProvider"

interface ProductDetailProps {
  product: Omit<Product, "price"> & {
    price: number | { toNumber: () => number }
    images?: { url: string }[]
    category?: { name: string } | null
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { isAuthenticated } = useSupabase()
  
  // Generate consistent seed based on product ID
  const productSeed = product.id
    ? parseInt(product.id.replace(/[^0-9]/g, "").slice(0, 3) || "1")
    : Math.floor(Math.random() * 1000)

  const imageUrl =
    product.images?.[0]?.url ||
    `https://picsum.photos/seed/${productSeed}/800/1000`
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(
    typeof product.price === "object" &&
      product.price !== null &&
      "toNumber" in product.price
      ? product.price.toNumber()
      : Number(String(product.price))
  )

  return (
    <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <nav className="flex text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Home
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li>
              <Link
                href="/products"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Products
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li className="font-medium text-gray-700 dark:text-gray-300">
              {product.name}
            </li>
          </ol>
        </nav>
        
        {/* Admin actions */}
        {isAuthenticated && (
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/products/edit/${product.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Product
            </Link>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              All Products
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Product Image */}
        <div className="overflow-hidden relative bg-gray-100 rounded-lg aspect-square dark:bg-gray-700">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {product.name}
          </h1>

          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {formattedPrice}
            </p>
          </div>

          {product.category && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {product.category.name}
              </span>
            </div>
          )}

          <div className="mt-6 text-gray-700 prose prose-sm dark:text-gray-300">
            <p>{product.description}</p>
          </div>

          {product.sku && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>SKU: {product.sku}</p>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Details
            </h3>
            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {product.isActive ? "In stock" : "Out of stock"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
