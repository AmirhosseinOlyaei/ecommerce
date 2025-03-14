"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import { Button, EditIcon, ListIcon } from "@/components/ui/Button"
import { useCart } from "@/context/CartContext"
import { type Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "./AddToCartButton"
import { BuyNowButton } from "./BuyNowButton"

interface ProductDetailProps {
  product: Omit<Product, "price"> & {
    price: number | { toNumber: () => number }
    images?: { url: string }[]
    category?: { name: string } | null
  }
}

interface CartItem {
  productId: string
  quantity: number
  inventory?: number
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { isAuthenticated } = useSupabase()
  const { items: cartItems } = useCart()
  const cartItemCount = cartItems.reduce(
    (total: number, item: CartItem) => total + item.quantity,
    0
  )
  const isInCart = cartItems.some(
    (item: CartItem) => item.productId === product.id
  )

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
            <Link href="/cart" className="relative mr-2">
              <Button variant="secondary">
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
                  className="mr-2"
                >
                  <circle cx="8" cy="21" r="1"></circle>
                  <circle cx="19" cy="21" r="1"></circle>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                </svg>
                Cart
                {cartItemCount > 0 && (
                  <span className="flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
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
                    {product.isActive ? (
                      <>
                        In stock
                        {product.inventory !== undefined && (
                          <span className="ml-2">
                            ({product.inventory}{" "}
                            {product.inventory === 1 ? "item" : "items"} left)
                          </span>
                        )}
                      </>
                    ) : (
                      "Out of stock"
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <AddToCartButton
                  product={{
                    ...product,
                    inventory:
                      product.inventory !== undefined
                        ? Number(product.inventory)
                        : undefined,
                  }}
                />

                <div className="mt-3">
                  <BuyNowButton
                    product={{
                      ...product,
                      inventory:
                        product.inventory !== undefined
                          ? Number(product.inventory)
                          : undefined,
                    }}
                  />
                </div>

                {/* Clear navigation options */}
                <div className="pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    What would you like to do next?
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Link
                      href="/cart"
                      className={`flex items-center justify-center p-4 rounded-lg border ${
                        isInCart
                          ? "bg-green-50 border-green-500 dark:bg-green-900/20"
                          : "border-gray-300 dark:border-gray-700"
                      } hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mb-2 w-8 h-8 text-blue-600 dark:text-blue-400"
                        >
                          <circle cx="8" cy="21" r="1"></circle>
                          <circle cx="19" cy="21" r="1"></circle>
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                        </svg>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {isInCart ? "View Your Cart" : "Go to Cart"}
                        </span>
                        {isInCart && (
                          <span className="mt-1 text-sm text-green-600 dark:text-green-400">
                            This item is in your cart
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link
                      href="/products"
                      className="flex justify-center items-center p-4 rounded-lg border border-gray-300 transition-colors dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex flex-col items-center text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mb-2 w-8 h-8 text-purple-600 dark:text-purple-400"
                        >
                          <line x1="8" y1="6" x2="21" y2="6"></line>
                          <line x1="8" y1="12" x2="21" y2="12"></line>
                          <line x1="8" y1="18" x2="21" y2="18"></line>
                          <line x1="3" y1="6" x2="3.01" y2="6"></line>
                          <line x1="3" y1="12" x2="3.01" y2="12"></line>
                          <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Browse More Products
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products section */}
        <div className="p-6 mt-12 bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Link
                key={i}
                href={`/products/${i}`}
                className="overflow-hidden rounded-lg shadow-md transition-shadow group hover:shadow-lg"
              >
                <div className="relative bg-gray-200 aspect-square dark:bg-gray-700">
                  <Image
                    src={`https://picsum.photos/seed/${product.id}-${i}/400`}
                    alt={`Related product ${i}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 transition-colors dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Related Product {i}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    ${(Math.random() * 100 + 10).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button href="/products" variant="secondary">
              View All Products
            </Button>
          </div>
        </div>

        {/* Shopping journey guide */}
        <div className="p-6 mt-12 bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            Complete Your Shopping Journey
          </h2>
          <div className="flex flex-col justify-between items-start space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full dark:bg-blue-900">
                <span className="font-bold text-blue-800 dark:text-blue-200">
                  1
                </span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Browse Products
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Explore our catalog
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full dark:bg-purple-900">
                <span className="font-bold text-purple-800 dark:text-purple-200">
                  2
                </span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Add to Cart
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select items you want
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-full dark:bg-green-900">
                <span className="font-bold text-green-800 dark:text-green-200">
                  3
                </span>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Checkout
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Complete your purchase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
