'use client'

import { useSupabase } from '@/components/auth/SupabaseProvider'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || 'N/A'
  const total = searchParams.get('total') || '0.00'
  const { isAuthenticated } = useSupabase()

  // If not authenticated, redirect to login
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg'>
        <div className='text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='rounded-full bg-green-100 p-3'>
              <svg
                className='h-12 w-12 text-green-600'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
          </div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Order Successful!
          </h1>
          <p className='mt-2 text-gray-600'>
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <div className='border-t border-b py-4'>
          <div className='my-2 flex justify-between'>
            <span className='font-medium'>Order ID:</span>
            <span className='text-gray-600'>{orderId}</span>
          </div>
          <div className='my-2 flex justify-between'>
            <span className='font-medium'>Total Amount:</span>
            <span className='text-gray-600'>${total}</span>
          </div>
        </div>

        <div className='mt-6 space-y-2 text-center'>
          <p className='text-sm text-gray-600'>
            The products you purchased have been removed from the marketplace
            inventory.
          </p>
          <p className='text-sm text-gray-500'>
            A confirmation email will be sent to your registered email address.
          </p>
        </div>

        <div className='mt-6 flex flex-col space-y-3'>
          <Link
            href='/products'
            className='rounded-md bg-purple-600 px-4 py-2 text-center text-white transition duration-200 hover:bg-purple-700'
          >
            Continue Shopping
          </Link>
          <Link
            href='/dashboard'
            className='rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-gray-700 transition duration-200 hover:bg-gray-50'
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
