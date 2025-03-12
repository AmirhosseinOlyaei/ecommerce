import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

// TEMPORARY PLACEHOLDER ROUTER
// This is a placeholder to allow the app to build successfully
// The full implementation will be restored once the Order model is added to the Prisma schema

export const orderRouter = createTRPCRouter({
  // Simplified placeholder endpoint
  getMyOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async () => {
      // Return empty array as placeholder
      return {
        items: [],
        nextCursor: undefined,
      };
    }),

  // Placeholder for getOrderById
  getOrderById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async () => {
      // Return empty placeholder
      return null;
    }),
});
