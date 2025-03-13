import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const productRouter = createTRPCRouter({
  // Get all products with optional filtering and pagination
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional(),
        categoryId: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["price", "name", "createdAt"]).optional().default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
        onlyActive: z.boolean().optional().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, minPrice, maxPrice, sortBy, sortOrder, onlyActive } = input;
      
      const items = await ctx.prisma.product.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }),
          ...(minPrice !== undefined && { price: { gte: minPrice } }),
          ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
          ...(onlyActive && { isActive: true }),
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: items.map(item => ({
          ...item,
          price: item.price.toNumber(), // Convert Decimal to Number
        })),
        nextCursor,
      };
    }),

  // Get a single product by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const product = await ctx.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return {
        ...product,
        price: product.price.toNumber(), // Convert Decimal to Number
      }
    }),

  // Get featured products
  getFeatured: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).optional().default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { limit } = input;
      
      const products = await ctx.prisma.product.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          price: 'desc',
        },
        take: limit,
      });
      
      return products.map(product => ({
        ...product,
        price: product.price.toNumber(), // Convert Decimal to Number
      }));
    }),

  // Search products
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(20).optional().default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      
      const products = await ctx.prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });
      
      return products.map(product => ({
        ...product,
        price: product.price.toNumber(), // Convert Decimal to Number
      }));
    }),

  // Create a new product
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      sku: z.string().optional(),
      inventory: z.number().min(0),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.create({
        data: {
          id: randomUUID(),
          ...input,
        },
      });
      return product;
    }),

  // Update an existing product
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().min(0),
        sku: z.string().optional(),
        inventory: z.number().min(0),
        isActive: z.boolean(),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.update({
        where: { id: input.id },
        data: input.data,
      });
      return product;
    }),

  // Delete a product
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.product.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

});
