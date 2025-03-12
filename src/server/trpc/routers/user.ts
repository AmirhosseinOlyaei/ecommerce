import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

export const userRouter = createTRPCRouter({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    // First check if user exists in our database
    let user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
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
          createdAt: true,
        },
      });
    }

    return user;
  }),

  // Get user addresses
  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.address.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { isDefault: "desc" },
    });
  }),

  // Add a new address
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
    .mutation(async ({ ctx, input }) => {
      const { isDefault, ...addressData } = input;

      // If this is the default address, unset other default addresses
      if (isDefault) {
        await ctx.prisma.address.updateMany({
          where: { userId: ctx.session.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return ctx.prisma.address.create({
        data: {
          ...addressData,
          isDefault,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update an address
  updateAddress: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        addressLine1: z.string().min(1).optional(),
        addressLine2: z.string().optional().nullable(),
        city: z.string().min(1).optional(),
        state: z.string().optional().nullable(),
        postalCode: z.string().min(1).optional(),
        country: z.string().min(1).optional(),
        phone: z.string().optional().nullable(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isDefault, ...addressData } = input;

      // Check if address belongs to user
      const address = await ctx.prisma.address.findUnique({
        where: { id },
      });

      if (!address || address.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // If this is the default address, unset other default addresses
      if (isDefault) {
        await ctx.prisma.address.updateMany({
          where: { userId: ctx.session.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return ctx.prisma.address.update({
        where: { id },
        data: {
          ...addressData,
          ...(isDefault !== undefined ? { isDefault } : {}),
        },
      });
    }),

  // Delete an address
  deleteAddress: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if address belongs to user
      const address = await ctx.prisma.address.findUnique({
        where: { id },
      });

      if (!address || address.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      await ctx.prisma.address.delete({
        where: { id },
      });

      return { success: true };
    }),

  // Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        image: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Sync with Supabase if email is changing
      if (input.email) {
        // Note: Updating email would typically require re-verification
        // This is just updating our local database, not the Supabase auth
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser && existingUser.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already in use",
          });
        }
      }

      // Update user profile in our database
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
        },
      });

      // Update user metadata in Supabase
      if (input.name) {
        await ctx.supabase.auth.updateUser({
          data: { full_name: input.name }
        });
      }

      return updatedUser;
    }),

  // ADMIN: Get users list (admin only)
  getUsers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        cursor: z.string().optional(),
        search: z.string().optional(),
        role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if the current user has admin access
      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        });
      }

      const { limit, cursor, search, role } = input;

      // Build the where clause
      const where: Prisma.UserWhereInput = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } }
        ];
      }
      if (role) {
        where.role = role;
      }

      // Get one more item than requested to determine if there are more items
      const users = await ctx.prisma.user.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
        },
      });

      // Check if there are more items
      const hasMore = users.length > limit;
      if (hasMore) {
        users.pop();
      }

      // Get the last item's cursor
      const nextCursor = hasMore ? users[users.length - 1]?.id : undefined;

      return {
        users,
        nextCursor,
        hasMore,
      };
    }),
});
