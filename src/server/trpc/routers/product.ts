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
      const { limit, cursor, categoryId, search, minPrice, maxPrice, sortBy, sortOrder, onlyActive } = input;
      
      const items = await ctx.prisma.product.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...(categoryId && { categoryId }),
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
        include: {
          category: true,
          images: {
            where: { isDefault: true },
            take: 1,
          },
        },
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
        include: {
          category: true,
          images: true,
          variants: {
            include: {
              attributes: true,
            },
          },
          reviews: {
            where: { isPublished: true },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    }),

  // Get a single product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { slug } = input;
      const product = await ctx.prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          images: true,
          variants: {
            include: {
              attributes: true,
            },
          },
          reviews: {
            where: { isPublished: true },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    }),

  // Create a new product (admin only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        price: z.number().positive(),
        inventory: z.number().int().nonnegative(),
        sku: z.string().min(1),
        slug: z.string().min(1),
        categoryId: z.string().optional(),
        weight: z.number().optional(),
        dimensions: z.string().optional(),
        images: z
          .array(
            z.object({
              url: z.string().url(),
              alt: z.string().optional(),
              isDefault: z.boolean().optional().default(false),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin (you might want to modify this check)
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { name, description, price, inventory, sku, slug, categoryId, weight, dimensions, images } = input;

      // Check if slug or SKU already exist
      const existingProduct = await ctx.prisma.product.findFirst({
        where: {
          OR: [{ slug }, { sku }],
        },
      });

      if (existingProduct) {
        throw new Error("A product with this slug or SKU already exists");
      }

      // Create product
      const product = await ctx.prisma.product.create({
        data: {
          name,
          description,
          price,
          inventory,
          sku,
          slug,
          categoryId,
          weight,
          dimensions,
        },
      });

      // Add images if provided
      if (images && images.length > 0) {
        await ctx.prisma.productImage.createMany({
          data: images.map((image) => ({
            ...image,
            productId: product.id,
          })),
        });
      }

      return product;
    }),

  // Update a product (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        price: z.number().positive().optional(),
        inventory: z.number().int().nonnegative().optional(),
        sku: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        categoryId: z.string().optional().nullable(),
        weight: z.number().optional().nullable(),
        dimensions: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { id, ...data } = input;

      // Check if product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Check if slug or SKU already exist if updating those fields
      if (data.slug || data.sku) {
        const existingProduct = await ctx.prisma.product.findFirst({
          where: {
            OR: [
              data.slug ? { slug: data.slug } : {},
              data.sku ? { sku: data.sku } : {},
            ],
            NOT: { id },
          },
        });

        if (existingProduct) {
          throw new Error("A product with this slug or SKU already exists");
        }
      }

      // Update product
      return ctx.prisma.product.update({
        where: { id },
        data,
      });
    }),

  // Delete a product (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { id } = input;

      // Check if product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Delete product
      await ctx.prisma.product.delete({
        where: { id },
      });

      return { success: true };
    }),

  // Add a product image
  addImage: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        url: z.string().url(),
        alt: z.string().optional(),
        isDefault: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { productId, url, alt, isDefault } = input;

      // Check if product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // If this is the default image, unset other default images
      if (isDefault) {
        await ctx.prisma.productImage.updateMany({
          where: { productId, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Add image
      return ctx.prisma.productImage.create({
        data: {
          productId,
          url,
          alt,
          isDefault,
        },
      });
    }),

  // Remove a product image
  removeImage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { id } = input;

      // Check if image exists
      const image = await ctx.prisma.productImage.findUnique({
        where: { id },
      });

      if (!image) {
        throw new Error("Image not found");
      }

      // Delete image
      await ctx.prisma.productImage.delete({
        where: { id },
      });

      return { success: true };
    }),
});
