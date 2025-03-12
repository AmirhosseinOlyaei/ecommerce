import { Auth } from '@/components/auth/Auth'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-sm text-gray-500 mt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
      
      <Auth view="sign_up" />
    </div>
  )
}
