import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

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
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }),
          ...(minPrice !== undefined && { price: { gte: minPrice } }),
          ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
          ...(onlyActive && { isActive: true }),
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        // Temporarily removed includes for category and images until schema is updated
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
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
        // Temporarily removed includes for related models until schema is updated
      });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    }),
});
