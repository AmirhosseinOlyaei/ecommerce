"use client"

import { api } from "@/lib/trpc/client"
import { useState } from "react"
import { ProductCard } from "./ProductCard"

// Define Category interface locally since it's not in the Prisma client
interface Category {
  id: string
  name: string
}

export function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Using tRPC to fetch products
  const {
    data: productsData,
    isLoading,
    error,
  } = api.product.getAll.useQuery({
    limit: 12,
    categoryId: selectedCategory,
    onlyActive: true,
    search: searchQuery.length > 2 ? searchQuery : undefined,
  })

  // Also fetch featured products
  const { data: featuredProducts } = api.product.getFeatured.useQuery({
    limit: 4,
  })

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
          <div className="mx-auto w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg dark:bg-red-900/20">
        <h3 className="font-semibold text-red-600 dark:text-red-400">
          Error loading products
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error.message}</p>
      </div>
    )
  }

  // Extract the actual products array from the data structure
  const products = productsData?.items || []

  const featuredProductsList = featuredProducts || []

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div className="mx-auto max-w-md">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2 text-gray-900 bg-white rounded-l-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Search
          </button>
        </form>
        {isSearching && searchQuery && (
          <div className="flex justify-between items-center mt-2 text-sm">
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
        <div className="flex flex-wrap gap-2 justify-center">
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
      {!isSearching &&
        featuredProductsList &&
        featuredProductsList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {featuredProductsList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {isSearching ? "Search Results" : "All Products"}
        </h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
