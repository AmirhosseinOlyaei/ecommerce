'use client'

import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CartPreviewButton() {
  const { items, itemCount, subtotal } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Format price with currency symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant='secondary'
        className='relative'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='mr-2'
        >
          <circle cx='8' cy='21' r='1'></circle>
          <circle cx='19' cy='21' r='1'></circle>
          <path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'></path>
        </svg>
        My Cart
        {itemCount > 0 && (
          <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
            {itemCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className='absolute right-0 z-50 mt-2 w-80 rounded-md border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='p-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
              Your Cart
            </h3>
            {items.length === 0 ? (
              <div className='py-4 text-center text-gray-500 dark:text-gray-400'>
                <p>Your cart is empty</p>
                <div className='mt-4'>
                  <Link href='/products'>
                    <span className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'>
                      Browse products
                    </span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className='mt-4 max-h-60 overflow-y-auto'>
                  {items.map(item => (
                    <div
                      key={item.productId}
                      className='flex border-b py-2 dark:border-gray-700'
                    >
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                          {item.name}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4 flex items-center justify-between border-t pt-2 dark:border-gray-700'>
                  <span className='text-base font-medium text-gray-900 dark:text-gray-100'>
                    Subtotal
                  </span>
                  <span className='text-base font-medium text-gray-900 dark:text-gray-100'>
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className='mt-4'>
                  <Link href='/cart'>
                    <Button
                      variant='primary'
                      className='w-full'
                      onClick={() => setIsOpen(false)}
                    >
                      View Cart
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
