"use client"

import { api } from "@/lib/trpc/client"
import { type Product } from "@prisma/client"
import { useState } from "react"
import { ProductCard } from "./ProductCard"

// Define Category interface locally since it's not in the Prisma client
interface Category {
  id: string
  name: string
}

// Define custom Product type for our component
interface ProductWithRelations extends Omit<Product, "price"> {
  price: number | string | { toString(): string } // Handle both number, string and Decimal types
  images?: { url: string }[]
  category?: { name: string } | null
}

export function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Using tRPC to fetch products with error handling for unauthenticated users
  const {
    data: productsData,
    isLoading,
    error,
  } = api.product.getAll.useQuery(
    {
      limit: 12,
      categoryId: selectedCategory,
      onlyActive: true,
      search: searchQuery.length > 2 ? searchQuery : undefined,
    },
    {
      // Don't retry on unauthorized errors (when user isn't logged in)
      retry: (failureCount, error) => {
        if (error?.message?.includes("UNAUTHORIZED")) return false
        return failureCount < 3 // Retry other errors up to 3 times
      },
      onError: (error) => {
        console.error("Error fetching products:", error)
      },
    }
  )

  // Featured products temporarily disabled
  /* 
  // Also fetch featured products with error handling
  const { data: featuredProducts } = api.product.getFeatured.useQuery(
    {
      limit: 4,
    },
    {
      // Don't retry on unauthorized errors (when user isn't logged in)
      retry: (failureCount, error) => {
        if (error?.message?.includes("UNAUTHORIZED")) return false
        return failureCount < 3 // Retry other errors up to 3 times
      },
      onError: (error) => {
        console.error("Error fetching featured products:", error)
      },
    }
  )
  */

  // Temporarily disabled until category router is implemented
  // const { data: categories } = api.category.getAll.useQuery()
  const categories: Category[] = [] // Empty array with proper type

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    // If unauthorized, show a friendlier message with login option
    if (error.message.includes("UNAUTHORIZED")) {
      return (
        <div className="p-8 text-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Sign in to view products
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please sign in to browse our product catalog and make purchases.
          </p>
          <a
            href="/login?redirect=/products"
            className="inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Sign In
          </a>
        </div>
      )
    }

    // For other errors, show the standard error message
    return (
      <div className="p-8 text-center rounded-lg bg-red-50 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-600 dark:text-red-400">
          Error loading products
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error.message}</p>
      </div>
    )
  }

  // Extract the actual products array from the data structure
  const products = productsData?.items || []

  // Featured products temporarily disabled
  // const featuredProductsList = featuredProducts || []

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div className="mx-auto">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-l-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Search
          </button>
        </form>
        {isSearching && searchQuery && (
          <div className="flex items-center justify-between mt-2 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              Search results for &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={clearSearch}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Category filter - temporarily disabled because the category router is not implemented */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === undefined
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category.id
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      {/* Featured Products section temporarily removed
      {!isSearching &&
        featuredProductsList &&
        featuredProductsList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {featuredProductsList.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as ProductWithRelations}
                />
              ))}
            </div>
          </div>
        )}
      */}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {isSearching ? "Search Results" : "All Products"}
        </h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product as ProductWithRelations}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {isSearching
                ? `No products found for "${searchQuery}"`
                : "No products available"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
