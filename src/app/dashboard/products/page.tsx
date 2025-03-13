"use client"

import { useSupabase } from "@/components/auth/SupabaseProvider"
import { api } from "@/lib/trpc/client"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function ProductManagementPage() {
  const { isLoading, isAuthenticated } = useSupabase()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Enhanced navigation function with navigation state
  const handleNavigation = useCallback(
    (path: string) => {
      if (isNavigating) return // Prevent multiple clicks

      setIsNavigating(true)
      console.log(`Navigating to: ${path}`)

      // Use router.push directly for Next.js page transitions
      router.push(path)
    },
    [router, isNavigating]
  )

  // Fetch products with tRPC
  const { data: productsData, isLoading: isLoadingProducts } =
    api.product.getAll.useQuery({
      limit: 100,
      onlyActive: false, // Show all products, including inactive ones
    })

  // Extract products from data
  const products = productsData?.items || []

  // Delete product functionality is temporarily disabled
  // due to the temporary fix in the product router
  const handleDeleteProduct = (productId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      setIsDeleting(productId)
      // Currently disabled due to router limitations
      console.log(
        "Delete product functionality is temporarily disabled",
        productId
      )

      // In a complete implementation, this would be:
      // deleteProductMutation.mutate({ id: productId })

      // For now, just simulate deletion
      setTimeout(() => {
        setIsDeleting(null)
        alert(
          "Product deletion is currently disabled in this development version"
        )
      }, 1000)
    }
  }

  // Handle product status toggle (also temporarily disabled)
  const handleToggleStatus = (product: {
    id: string
    isActive: boolean
    name: string
    price: string
    sku: string
    inventory: number
    updatedAt: Date
  }) => {
    // Currently disabled due to router limitations
    console.log("Toggle product status is temporarily disabled", product.id)

    // In a complete implementation, this would be:
    // toggleProductStatusMutation.mutate({
    //   id: product.id,
    //   data: { isActive: !product.isActive },
    // })

    // For now, just show a message
    alert(
      `Product status toggle is currently disabled in this development version. Would toggle ${
        product.name
      } to ${!product.isActive ? "active" : "inactive"}`
    )
  }

  // Show loading state
  if (isLoading || isNavigating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-gray-900 animate-spin dark:border-gray-100"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirecting will happen via useEffect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Product Management
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => handleNavigation("/dashboard")}
            className="px-4 py-2 text-gray-800 bg-gray-200 rounded transition dark-mode-bg-secondary hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => handleNavigation("/dashboard/products/new")}
            className="px-4 py-2 text-white bg-blue-500 rounded transition dark-mode-bg-primary dark:hover:bg-blue-600 hover:bg-blue-600"
          >
            Add New Product
          </button>
        </div>
      </div>

      {isLoadingProducts ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin dark:border-blue-400"></div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    SKU
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Inventory
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Last Updated
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className={
                        product.isActive ? "" : "bg-gray-50 dark:bg-gray-900/20"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          ${parseFloat(product.price.toString()).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.inventory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              handleToggleStatus({
                                id: product.id,
                                isActive: product.isActive,
                                name: product.name,
                                price: product.price.toString(),
                                sku: product.sku || "",
                                inventory: product.inventory,
                                updatedAt: product.updatedAt,
                              })
                            }
                            className={`px-2 py-1 rounded text-xs ${
                              product.isActive
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark-mode-bg-secondary dark:hover:bg-yellow-800"
                                : "bg-green-100 text-green-800 hover:bg-green-200 dark-mode-bg-secondary dark:hover:bg-green-800"
                            }`}
                          >
                            {product.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() =>
                              handleNavigation(
                                `/dashboard/products/edit/${product.id}`
                              )
                            }
                            className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded hover:bg-blue-200 dark-mode-bg-primary dark:hover:bg-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isDeleting === product.id}
                            className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded hover:bg-red-200 dark-mode-bg-secondary dark:hover:bg-red-800 disabled:opacity-50"
                          >
                            {isDeleting === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                    >
                      No products found.
                      <button
                        onClick={() =>
                          handleNavigation("/dashboard/products/new")
                        }
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Add your first product
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
