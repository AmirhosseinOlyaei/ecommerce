'use client'

import { ProductForm } from './ProductForm'
import Link from 'next/link'

interface EditProductClientProps {
  productId: string
}

export function EditProductClient({ productId }: EditProductClientProps) {
  return (
    <div className='mx-auto max-w-4xl p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
          Edit Product
        </h1>
        <Link
          href='/dashboard/products'
          className='rounded bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        >
          Back to Products
        </Link>
      </div>

      <ProductForm productId={productId} />
    </div>
  )
}
