import { createTRPCRouter, protectedProcedure } from "../trpc";

// Temporarily commenting out the cart router to fix build errors
// TODO: Add Cart and CartItem models to the Prisma schema before uncommenting
export const cartRouter = createTRPCRouter({
  // Empty placeholder to allow the build to succeed
  placeholder: protectedProcedure.query(async () => {
    return { message: "Cart functionality not yet implemented" };
  }),
});
