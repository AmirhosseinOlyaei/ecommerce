"use client"

import { ProductList } from "./ProductList"

export function ProductsClientPage() {
  return (
    <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-between">
          <p className="text-2xl text-gray-500 dark:text-gray-400">
            Browse our collection of products
          </p>

          <div>{/* <CartPreviewButton /> */}</div>
        </div>
      </div>

      <ProductList />
    </div>
  )
}
