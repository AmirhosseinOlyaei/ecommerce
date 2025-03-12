import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

// TEMPORARY PLACEHOLDER ROUTER
// This is a placeholder to allow the app to build successfully
// The full implementation will be restored once the User model is fully defined in the Prisma schema

export const userRouter = createTRPCRouter({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    // Simplified version that only includes fields known to exist in the User model
    let user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        // createdAt removed to fix build error
      },
    });

    // If user doesn't exist in our database, create it from Supabase data
    if (!user) {
      // Get Supabase user data
      const supabaseUser = ctx.session.user;
      
      // Create user in our database
      user = await ctx.prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: supabaseUser.user_metadata?.full_name || "User",
          image: supabaseUser.user_metadata?.avatar_url || null,
          role: (supabaseUser.user_metadata?.role?.toUpperCase() as "ADMIN" | "STAFF" | "CUSTOMER") || "CUSTOMER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          // createdAt removed to fix build error
        },
      });
    }

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
