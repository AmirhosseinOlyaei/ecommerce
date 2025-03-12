import { z } from "zod";
import { hash } from "bcryptjs";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
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

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
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
        password: z.string().min(6).optional(),
        image: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { password, ...userData } = input;

      // If email is changing, check if it's already in use
      if (userData.email) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser && existingUser.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already in use",
          });
        }
      }

      // Update user data
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...userData,
          ...(password ? { password: await hash(password, 12) } : {}),
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
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { limit, cursor, search, role } = input;

      const users = await ctx.prisma.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...(search && {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }),
          ...(role && { role }),
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              addresses: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: users,
        nextCursor,
      };
    }),

  // ADMIN: Update user role (admin only)
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { userId, role } = input;

      // Prevent changing own role
      if (userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change your own role",
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return ctx.prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    }),
});
