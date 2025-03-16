'use client'

import { useSupabase } from '@/components/auth/SupabaseProvider'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || 'N/A'
  const rawTotal = searchParams.get('total') || '0'
  const [formattedTotal, setFormattedTotal] = useState('0.00')
  const { isAuthenticated } = useSupabase()

  // Format the total correctly when component mounts or when rawTotal changes
  useEffect(() => {
    try {
      // Parse the total and ensure it's a valid number
      const numericTotal = parseFloat(rawTotal)
      if (!isNaN(numericTotal)) {
        setFormattedTotal(numericTotal.toFixed(2))
      } else {
        setFormattedTotal('0.00')
      }
    } catch (e) {
      console.error('Error formatting total:', e)
      setFormattedTotal('0.00')
    }
  }, [rawTotal])

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
            <span className='text-gray-600'>${formattedTotal}</span>
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

        <div className='mt-6 flex justify-between space-x-3'>
          <Link
            href='/orders'
            className='flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-white transition duration-200 hover:bg-blue-700'
          >
            View My Orders
          </Link>
          <Link
            href='/products'
            className='flex-1 rounded-md bg-purple-600 px-4 py-2 text-center text-white transition duration-200 hover:bg-purple-700'
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
