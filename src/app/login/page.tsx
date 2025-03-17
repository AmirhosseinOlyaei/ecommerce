'use client'

import { Auth } from '@/components/auth/Auth'
import Link from 'next/link'
import { Button, HomeIcon, ListIcon } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  return (
    <>
      <div className='flex items-center justify-between p-6 mx-auto max-w-7xl'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
          Login
        </h1>
        <div className='flex items-center space-x-4'>
          <Button
            onClick={() => router.push('/')}
            variant='primary'
            icon={<HomeIcon />}
          >
            Home
          </Button>
          <Button
            onClick={() => router.push('/products')}
            variant='secondary'
            icon={<ListIcon />}
          >
            Products
          </Button>
        </div>
      </div>
      
      <div className='max-w-md p-6 mx-auto my-12 bg-white rounded-lg shadow-lg'>
        <div className='mb-6 text-center'>
          <h1 className='text-2xl font-bold'>Log in to your account</h1>
          <p className='mt-2 text-sm text-gray-500'>
            Don&apos;t have an account?{' '}
            <Link href='/signup' className='text-blue-600 hover:underline'>
              Sign up
            </Link>
          </p>
        </div>

        <Auth view='sign_in' />
      </div>
    </>
  )
}
