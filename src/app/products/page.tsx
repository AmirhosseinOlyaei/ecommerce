'use client'

import { CartPreviewButton } from '@/components/cart/CartPreviewButton'
import { ProductsClientPage } from '@/components/products/ProductsClientPage'
import { Button, HomeIcon, ListIcon } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function ProductsPage() {
  const router = useRouter()

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className='container mx-auto max-w-7xl p-6'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Products
          </h1>
          <div className='flex items-center space-x-4'>
            <CartPreviewButton />
            <Button
              onClick={() => router.push('/dashboard')}
              variant='secondary'
              icon={<ListIcon />}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant='primary'
              icon={<HomeIcon />}
            >
              Home
            </Button>
          </div>
        </div>
        <div className='mb-6 max-w-7xl rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-700'>
          <ProductsClientPage />
        </div>
      </div>
    </div>
  )
}
