import { Auth } from '@/components/auth/Auth'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className='mx-auto my-12 max-w-md rounded-lg bg-white p-6 shadow-lg'>
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
  )
}
