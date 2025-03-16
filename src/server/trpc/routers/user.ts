import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

// TEMPORARY PLACEHOLDER ROUTER
// This is a placeholder to allow the app to build successfully
// The full implementation will be restored once the User model is fully defined in the Prisma schema

export const userRouter = createTRPCRouter({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    // Since the User model doesn't exist yet, return mocked user data from session
    const supabaseUser = ctx.session.user;
    
    // Create a mock user object
    const user = {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.full_name || "User",
      image: supabaseUser.user_metadata?.avatar_url || null,
      role: (supabaseUser.user_metadata?.role?.toUpperCase() as "ADMIN" | "STAFF" | "CUSTOMER") || "CUSTOMER",
    };

    return user;
  }),

  // Simplified placeholder endpoints for address operations
  getAddresses: protectedProcedure.query(async () => {
    return [];
  }),

  addAddress: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        addressLine1: z.string().min(1),
        addressLine2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().optional(),
        postalCode: z.string().min(1),
        country: z.string().min(1),
        phone: z.string().optional(),
        isDefault: z.boolean().optional().default(false),
      })
    )
    .mutation(async () => {
      return { id: 'placeholder' };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        image: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        id: ctx.session.user.id,
        ...input
      };
    }),
});
