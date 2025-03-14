"use client"

import { api } from "@/lib/trpc/client"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface ProductFormProps {
  productId?: string
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [isNavigating, setIsNavigating] = useState(false)
  const [skuError, setSkuError] = useState("")

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
  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
  } = api.product.getById.useQuery(
    { id: productId || "" },
    {
      enabled: !!productId,
      retry: 1,
      onError: (error) => {
        console.error("Error fetching product:", error)
        setFormError(`Failed to load product: ${error.message}`)
      },
    }
  )

  // Populate form with existing data when available
  useEffect(() => {
    if (productData && productId) {
      try {
        setFormData({
          name: productData.name,
          price: productData.price.toFixed(2), // Convert Decimal to string using toFixed if necessary
          description: productData.description || "",
          sku: productData.sku || "",
          inventory: productData.inventory.toString(),
          isActive: productData.isActive,
        })
      } catch (err) {
        console.error("Error formatting product data:", err)
        setFormError("Error processing product data")
      }
    }
  }, [productData, productId])

  // Add mutation hooks at the beginning of the ProductForm component
  const createProductMutation = api.product.create.useMutation({
    onSuccess: () => {
      handleNavigation("/dashboard/products")
    },
    onError: (error) => {
      console.error("Create product error:", error)

      // Handle specific unique constraint error for SKU
      if (
        error.message.includes(
          "Unique constraint failed on the fields: (`sku`)"
        )
      ) {
        setSkuError("This SKU already exists. Please use a different one.")
        setFormError("Product could not be created: SKU already in use")
      } else {
        setFormError(`Failed to create product: ${error.message}`)
      }

      setIsSubmitting(false)
    },
  })

  const updateProductMutation = api.product.update.useMutation({
    onSuccess: () => {
      handleNavigation("/dashboard/products")
    },
    onError: (error) => {
      console.error("Update product error:", error)

      // Handle specific unique constraint error for SKU
      if (
        error.message.includes(
          "Unique constraint failed on the fields: (`sku`)"
        )
      ) {
        setSkuError("This SKU already exists. Please use a different one.")
        setFormError("Product could not be updated: SKU already in use")
      } else {
        setFormError(`Failed to update product: ${error.message}`)
      }

      setIsSubmitting(false)
    },
  })

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target

    // Clear SKU error when user edits the SKU field
    if (name === "sku") {
      setSkuError("")
    }

    try {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }))
    } catch (err) {
      console.error("Error updating form data:", err)
    }
  }

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")
    setSkuError("")

    try {
      // Validate input values before parsing
      if (isNaN(parseFloat(formData.price))) {
        throw new Error("Invalid price format")
      }

      if (isNaN(parseInt(formData.inventory, 10))) {
        throw new Error("Invalid inventory format")
      }

      // If SKU is provided, ensure it follows proper format
      if (formData.sku && formData.sku.trim() !== "") {
        // You can add additional SKU validation rules here if needed
        // For example, checking for alphanumeric format, specific length, etc.
        if (formData.sku.length > 50) {
          setSkuError("SKU must be 50 characters or less")
          setIsSubmitting(false)
          return
        }
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        price: parseFloat(formData.price),
        sku: formData.sku?.trim() || "",
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
      console.error("Form submission error:", err)
      setFormError(errorMessage)
      setIsSubmitting(false)
    }
  }

  if (productId && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin dark:border-blue-400"></div>
      </div>
    )
  }

  if (productError && productId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="p-4 text-red-700 bg-red-50 rounded border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <h3 className="text-lg font-medium">Error Loading Product</h3>
          <p>{formError || "Failed to load product data. Please try again."}</p>
          <button
            onClick={() => handleNavigation("/dashboard/products")}
            className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Return to Products
          </button>
        </div>
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
          className={`block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border ${
            skuError
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          } shadow-sm dark:border-gray-700 focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-gray-100`}
        />
        {skuError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {skuError}
          </p>
        )}
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
