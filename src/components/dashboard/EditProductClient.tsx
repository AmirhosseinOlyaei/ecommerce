"use client"

import { ProductForm } from "./ProductForm"
import Link from "next/link"

interface EditProductClientProps {
  productId: string
}

export function EditProductClient({ productId }: EditProductClientProps) {
  return (
    <div className="p-6 mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Product
        </h1>
        <Link
          href="/dashboard/products"
          className="px-4 py-2 text-gray-800 bg-gray-200 rounded transition dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back to Products
        </Link>
      </div>

      <ProductForm productId={productId} />
    </div>
  )
}
