"use client"

import { api } from "@/lib/trpc/client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

interface ProductFormProps {
  productId?: string
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [isNavigating, setIsNavigating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    sku: "",
    inventory: "0",
    isActive: true,
  })

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

  // Fetch existing product data if editing
  const { data: productData, isLoading: isLoadingProduct } =
    api.product.getById.useQuery(
      { id: productId || "" },
      { enabled: !!productId }
    )

  // Populate form with existing data when available
  useEffect(() => {
    if (productData && productId) {
      setFormData({
        name: productData.name,
        price: productData.price.toFixed(2), // Convert Decimal to string using toFixed if necessary
        description: productData.description || "",
        sku: productData.sku || "",
        inventory: productData.inventory.toString(),
        isActive: productData.isActive,
      })
    }
  }, [productData, productId])

  // Add mutation hooks at the beginning of the ProductForm component
  const createProductMutation = api.product.create.useMutation({
    onSuccess: () => {
      handleNavigation("/dashboard/products")
    },
    onError: (error) => {
      setFormError(error.message)
      setIsSubmitting(false)
    },
  })

  const updateProductMutation = api.product.update.useMutation({
    onSuccess: () => {
      handleNavigation("/dashboard/products")
    },
    onError: (error) => {
      setFormError(error.message)
      setIsSubmitting(false)
    },
  })

  // Note: Create and update mutations are simulated because the product router
  // has been temporarily simplified as part of the build error fixes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")

    try {
      const productData = {
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price),
        sku: formData.sku || "",
        inventory: parseInt(formData.inventory, 10),
        isActive: formData.isActive,
      }

      if (productId) {
        updateProductMutation.mutate({ id: productId, data: productData })
      } else {
        createProductMutation.mutate(productData)
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred"
      setFormError(errorMessage)
      setIsSubmitting(false)
    }
  }

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  if (productId && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin dark:border-blue-400"></div>
      </div>
    )
  }

  if (isNavigating) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin dark:border-blue-400"></div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-6 bg-white rounded-lg shadow dark:bg-gray-800"
    >
      {formError && (
        <div
          className="relative px-4 py-3 text-red-700 bg-red-50 rounded border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
          role="alert"
        >
          <span className="block sm:inline">{formError}</span>
        </div>
      )}

      {/* Product Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Product Name *
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* SKU */}
      <div>
        <label
          htmlFor="sku"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          SKU
        </label>
        <input
          type="text"
          name="sku"
          id="sku"
          value={formData.sku}
          onChange={handleChange}
          className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Price and Inventory in a grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Price ($) *
          </label>
          <input
            type="number"
            name="price"
            id="price"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="inventory"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Inventory *
          </label>
          <input
            type="number"
            name="inventory"
            id="inventory"
            required
            min="0"
            value={formData.inventory}
            onChange={handleChange}
            className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={formData.isActive}
          onChange={handleCheckboxChange}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-700"
        />
        <label
          htmlFor="isActive"
          className="block ml-2 text-sm text-gray-700 dark:text-gray-300"
        >
          Product is active (visible to customers)
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => handleNavigation("/dashboard/products")}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent shadow-sm dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Saving..."
            : productId
            ? "Update Product"
            : "Create Product"}
        </button>
      </div>
    </form>
  )
}
