import { createTRPCRouter, publicProcedure } from '../trpc'

// Temporarily commenting out the category router to fix build errors
// TODO: Add Category model to the Prisma schema before uncommenting
export const categoryRouter = createTRPCRouter({
  // Empty placeholder to allow the build to succeed
  placeholder: publicProcedure.query(async () => {
    return { message: 'Category functionality not yet implemented' }
  }),
})
