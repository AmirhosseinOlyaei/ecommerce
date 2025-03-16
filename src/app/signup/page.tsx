import { Auth } from '@/components/auth/Auth'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className='mx-auto my-12 max-w-md rounded-lg bg-white p-6 shadow-lg'>
      <div className='mb-6 text-center'>
        <h1 className='text-2xl font-bold'>Create an account</h1>
        <p className='mt-2 text-sm text-gray-500'>
          Already have an account?{' '}
          <Link href='/login' className='text-blue-600 hover:underline'>
            Log in
          </Link>
        </p>
      </div>

      <Auth view='sign_up' />
    </div>
  )
}
