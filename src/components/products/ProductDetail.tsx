"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import { Button, EditIcon, ListIcon } from "@/components/ui/Button"
import { type Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "./AddToCartButton"

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
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container p-6 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Product Details
          </h1>
          <div className="flex items-center space-x-4">
            <Button href="/products" variant="secondary" icon={<ListIcon />}>
              All Products
            </Button>
            {isAuthenticated && (
              <Button
                href={`/dashboard/products/edit/${product.id}`}
                variant="primary"
                icon={<EditIcon />}
              >
                Edit Product
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 mb-6 bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
          {/* Breadcrumb navigation */}
          <nav className="flex mb-6 text-sm">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {product.name}
              </h2>

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
      </div>
    </div>
  )
}
