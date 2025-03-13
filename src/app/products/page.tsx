"use client"

import { ProductsClientPage } from "@/components/products/ProductsClientPage"
import { useRouter } from "next/navigation"

export default function ProductsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container p-6 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Products
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-gray-200 rounded-lg shadow-md transition dark-mode-bg-secondary hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow-md transition dark-mode-bg-primary dark:hover:bg-blue-600 hover:bg-blue-600"
            >
              Home
            </button>
          </div>
        </div>
        <div className="p-6 mb-6 max-w-7xl bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
          <ProductsClientPage />
        </div>
      </div>
    </div>
  )
}
