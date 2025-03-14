"use client"

import { ProductsClientPage } from "@/components/products/ProductsClientPage"
import { Button, HomeIcon, ListIcon } from "@/components/ui/Button"
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
            <Button
              onClick={() => router.push("/dashboard")}
              variant="secondary"
              icon={<ListIcon />}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="primary"
              icon={<HomeIcon />}
            >
              Home
            </Button>
          </div>
        </div>
        <div className="p-6 mb-6 max-w-7xl bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
          <ProductsClientPage />
        </div>
      </div>
    </div>
  )
}
