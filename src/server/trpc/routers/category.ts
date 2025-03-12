import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  // Get all categories
  getAll: publicProcedure
    .input(
      z.object({
        includeProducts: z.boolean().optional().default(false),
        parentId: z.string().optional().nullable(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const includeProducts = input?.includeProducts ?? false;
      const parentId = input?.parentId;

      return ctx.prisma.category.findMany({
        where: {
          parentId: parentId ?? null,
        },
        include: {
          children: {
            include: {
              _count: {
                select: {
                  products: true,
                },
              },
            },
          },
          ...(includeProducts && {
            products: {
              take: 6, // Limit number of products
              where: { isActive: true },
              include: {
                images: {
                  where: { isDefault: true },
                  take: 1,
                },
              },
            },
            _count: {
              select: {
                products: true,
              },
            },
          }),
        },
        orderBy: { name: "asc" },
      });
    }),

  // Get a single category by ID with its products
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        productsLimit: z.number().min(1).max(100).optional().default(12),
        productsCursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id, productsLimit, productsCursor } = input;

      const category = await ctx.prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Get products for this category
      const products = await ctx.prisma.product.findMany({
        take: productsLimit + 1,
        cursor: productsCursor ? { id: productsCursor } : undefined,
        where: {
          categoryId: id,
          isActive: true,
        },
        include: {
          images: {
            where: { isDefault: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Check if there are more products
      let nextCursor: typeof productsCursor | undefined = undefined;
      if (products.length > productsLimit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        ...category,
        products: {
          items: products,
          nextCursor,
        },
      };
    }),

  // Get a single category by slug with its products
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        productsLimit: z.number().min(1).max(100).optional().default(12),
        productsCursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { slug, productsLimit, productsCursor } = input;

      const category = await ctx.prisma.category.findUnique({
        where: { slug },
        include: {
          parent: true,
          children: true,
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Get products for this category
      const products = await ctx.prisma.product.findMany({
        take: productsLimit + 1,
        cursor: productsCursor ? { id: productsCursor } : undefined,
        where: {
          categoryId: category.id,
          isActive: true,
        },
        include: {
          images: {
            where: { isDefault: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Check if there are more products
      let nextCursor: typeof productsCursor | undefined = undefined;
      if (products.length > productsLimit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        ...category,
        products: {
          items: products,
          nextCursor,
        },
      };
    }),

  // Admin: Create a new category
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        slug: z.string().min(1),
        imageUrl: z.string().url().optional(),
        parentId: z.string().optional().nullable(),
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

      const { name, description, slug, imageUrl, parentId } = input;

      // Check if slug already exists
      const existingCategory = await ctx.prisma.category.findUnique({
        where: { slug },
      });

      if (existingCategory) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A category with this slug already exists",
        });
      }

      // Check if parent category exists if provided
      if (parentId) {
        const parentCategory = await ctx.prisma.category.findUnique({
          where: { id: parentId },
        });

        if (!parentCategory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent category not found",
          });
        }
      }

      return ctx.prisma.category.create({
        data: {
          name,
          description,
          slug,
          imageUrl,
          parentId,
        },
      });
    }),

  // Admin: Update a category
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        slug: z.string().min(1).optional(),
        imageUrl: z.string().url().optional().nullable(),
        parentId: z.string().optional().nullable(),
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

      const { id, slug, parentId, ...data } = input;

      // Check if category exists
      const category = await ctx.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Check if slug already exists if changing
      if (slug && slug !== category.slug) {
        const existingCategory = await ctx.prisma.category.findUnique({
          where: { slug },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A category with this slug already exists",
          });
        }
      }

      // Check for circular references if changing parent
      if (parentId && parentId !== category.parentId) {
        // Can't set parent to itself
        if (parentId === id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A category cannot be its own parent",
          });
        }

        // Check if parent category exists
        const parentCategory = await ctx.prisma.category.findUnique({
          where: { id: parentId },
        });

        if (!parentCategory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent category not found",
          });
        }

        // Check if the new parent is a child of this category (would create a loop)
        if (await isChildCategory(ctx.prisma, id, parentId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot set a child category as parent (circular reference)",
          });
        }
      }

      return ctx.prisma.category.update({
        where: { id },
        data: {
          ...data,
          ...(slug && { slug }),
          parentId,
        },
      });
    }),

  // Admin: Delete a category
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reassignProductsTo: z.string().optional(),
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

      const { id, reassignProductsTo } = input;

      // Check if category exists
      const category = await ctx.prisma.category.findUnique({
        where: { id },
        include: {
          children: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Check if it has child categories
      if (category.children.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a category with child categories",
        });
      }

      // If reassigning products, check if target category exists
      if (reassignProductsTo) {
        const targetCategory = await ctx.prisma.category.findUnique({
          where: { id: reassignProductsTo },
        });

        if (!targetCategory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Target category for reassignment not found",
          });
        }

        // Update products to new category
        if (category._count.products > 0) {
          await ctx.prisma.product.updateMany({
            where: { categoryId: id },
            data: { categoryId: reassignProductsTo },
          });
        }
      } else if (category._count.products > 0) {
        // If products exist and no reassignment, set them to null category
        await ctx.prisma.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: null },
        });
      }

      // Delete the category
      await ctx.prisma.category.delete({
        where: { id },
      });

      return { success: true };
    }),
});

// Helper function to check if a category is a child of another
async function isChildCategory(prisma: import("@prisma/client").PrismaClient, parentId: string, potentialChildId: string): Promise<boolean> {
  const childCategories = await prisma.category.findMany({
    where: { parentId },
    select: { id: true },
  });

  for (const child of childCategories) {
    if (child.id === potentialChildId) {
      return true;
    }

    // Recursively check children
    if (await isChildCategory(prisma, child.id, potentialChildId)) {
      return true;
    }
  }

  return false;
}
