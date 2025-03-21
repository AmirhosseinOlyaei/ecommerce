'use client'

import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import { api } from '@/lib/trpc/client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type AddToCartButtonProps = {
  product: {
    id: string
    name: string
    price: unknown
    inventory?: number
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, items } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const isInCart = items.some(item => item.productId === product.id)

  // Query to get the latest product inventory
  const { data: currentProduct } = api.product.getById.useQuery(
    { id: product.id },
    {
      enabled: !!product.id,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true, // Refetch when user focuses the window
    }
  )

  // Reset success message after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showSuccess])

  const handleAddToCart = () => {
    // First check displayed inventory from component props
    if (product.inventory !== undefined && quantity > product.inventory) {
      toast.error(`Sorry, only ${product.inventory} items available`)
      return
    }

    // Then double-check with latest inventory from the database
    if (currentProduct && currentProduct.inventory < quantity) {
      toast.error(`Sorry, only ${currentProduct.inventory} items available now`)
      return
    }

    setIsAdding(true)

    // Create a normalized price
    let validPrice: number
    if (typeof product.price === 'number') {
      validPrice = product.price
    } else if (
      typeof product.price === 'object' &&
      product.price !== null &&
      'toNumber' in product.price &&
      typeof product.price.toNumber === 'function'
    ) {
      validPrice = product.price.toNumber()
    } else {
      validPrice = parseFloat(String(product.price))
    }

    if (isNaN(validPrice) || validPrice <= 0) {
      toast.error(`Invalid price for ${product.name}.`)
      setIsAdding(false)
      return
    }

    try {
      addToCart({
        productId: product.id,
        name: product.name,
        price: validPrice,
        quantity,
      })

      setShowSuccess(true)
      toast.success(`${product.name} added to cart!`)
    } catch (error) {
      toast.error('Failed to add product to cart')
      console.error('Add to cart error:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className='flex flex-col'>
      <div className='mb-4 flex space-x-2'>
        <div className='relative flex w-28 flex-row rounded-md border'>
          <button
            type='button'
            className='flex w-8 items-center justify-center rounded-l-md bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-300'
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isAdding}
          >
            -
          </button>
          <span className='flex w-12 items-center justify-center text-sm font-medium text-gray-900 dark:text-gray-300'>
            {quantity}
          </span>
          <button
            type='button'
            className='flex w-8 items-center justify-center rounded-r-md bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-300'
            onClick={() => {
              // Check inventory limits when increasing quantity
              const inventoryToCheck =
                currentProduct?.inventory ?? product.inventory
              if (
                inventoryToCheck !== undefined &&
                quantity >= inventoryToCheck
              ) {
                toast.error(`Sorry, only ${inventoryToCheck} items available`)
                return
              }
              setQuantity(quantity + 1)
            }}
            disabled={isAdding}
          >
            +
          </button>
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={
          isAdding ||
          (product.inventory !== undefined && product.inventory <= 0) ||
          (currentProduct?.inventory !== undefined &&
            currentProduct.inventory <= 0)
        }
        className='w-full border-blue-700 bg-blue-600 py-2.5 text-base font-medium text-white hover:bg-blue-700 dark:border-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800'
        variant='primary'
      >
        {isAdding ? (
          <div className='flex items-center justify-center space-x-2'>
            <div className='h-4 w-4 animate-spin rounded-full border-t-2 border-r-2 border-white dark:border-gray-800'></div>
            <span>Adding...</span>
          </div>
        ) : isInCart ? (
          <span className='flex items-center justify-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='mr-2 h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            Add More to Cart
          </span>
        ) : (
          <span className='flex items-center justify-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='mr-2 h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            Add to Cart
          </span>
        )}
      </Button>

      {showSuccess && (
        <div className='mt-2 rounded-md bg-green-100 p-2 text-center text-sm font-medium text-green-600 dark:bg-green-900 dark:text-green-300'>
          Added to cart successfully!
        </div>
      )}
    </div>
  )
}
