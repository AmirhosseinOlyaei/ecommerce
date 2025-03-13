"use client"

import Link from "next/link"

export default function OrdersPage() {
  return (
    <div className="p-6 mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        My Orders
      </h1>
      <div className="p-8 text-center bg-white rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl text-gray-900 dark:text-gray-100">
          Your order history will appear here
        </h2>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Order functionality is coming soon. When you place orders, they will
          appear here for you to track.
        </p>
        <Link
          href="/"
          className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md transition-colors dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
