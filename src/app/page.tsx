import Link from 'next/link'

export default function Home() {
  return (
    <div className='grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20'>
      <main className='row-start-2 flex flex-col items-center gap-[32px] sm:items-start'>
        {/* <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        /> */}
        <h1 className='text-center text-4xl font-bold sm:text-left'>
          E-commerce Platform
        </h1>
        <p className='max-w-2xl text-center text-xl text-gray-600 sm:text-left'>
          A modern e-commerce solution with Next.js, Prisma, tRPC, and Supabase
        </p>

        <div className='flex flex-col items-center gap-4 sm:flex-row'>
          <Link
            className='bg-foreground text-background flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-transparent px-4 text-sm font-medium transition-colors hover:bg-[#383838] sm:h-12 sm:w-auto sm:px-5 sm:text-base dark:hover:bg-[#ccc]'
            href='/products'
          >
            View Products
          </Link>
          <Link
            className='flex h-10 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:w-auto sm:px-5 sm:text-base md:w-[158px] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]'
            href='/login'
          >
            Sign In
          </Link>
        </div>
      </main>
      {/* Removed duplicate footer buttons */}
    </div>
  )
}
