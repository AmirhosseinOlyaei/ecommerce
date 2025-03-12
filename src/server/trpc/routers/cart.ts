import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const cartRouter = createTRPCRouter({
  // Get the current user's cart
  getCart: protectedProcedure.query(async ({ ctx }) => {
    // Try to find the user's cart
    let cart = await ctx.prisma.cart.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isDefault: true },
                  take: 1,
                },
              },
            },
            variant: true,
          },
        },
      },
    });

    // If no cart exists, create one
    if (!cart) {
      cart = await ctx.prisma.cart.create({
        data: {
          userId: ctx.session.user.id,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isDefault: true },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((acc, item) => {
      const price = item.variant?.price ?? item.product.price;
      return acc + price * item.quantity;
    }, 0);

    return {
      ...cart,
      subtotal,
    };
  }),

  // Add an item to the cart
  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { productId, variantId, quantity } = input;

      // Check if product exists and is active
      const product = await ctx.prisma.product.findUnique({
        where: { id: productId, isActive: true },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found or is inactive",
        });
      }

      // If variant is specified, check if it exists
      if (variantId) {
        const variant = await ctx.prisma.productVariant.findUnique({
          where: { id: variantId, productId },
        });

        if (!variant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product variant not found",
          });
        }
      }

      // Get or create cart
      let cart = await ctx.prisma.cart.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!cart) {
        cart = await ctx.prisma.cart.create({
          data: {
            userId: ctx.session.user.id,
          },
        });
      }

      // Check if item already exists in cart
      const existingCartItem = await ctx.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          ...(variantId ? { variantId } : { variantId: null }),
        },
      });

      if (existingCartItem) {
        // Update quantity of existing item
        await ctx.prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + quantity,
            updatedAt: new Date(),
          },
        });
      } else {
        // Add new item to cart
        await ctx.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            variantId,
            quantity,
          },
        });
      }

      // Return updated cart
      return ctx.prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isDefault: true },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
        },
      });
    }),

  // Update cart item quantity
  updateItemQuantity: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { cartItemId, quantity } = input;

      // Find the cart item
      const cartItem = await ctx.prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true },
      });

      if (!cartItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      // Check if the cart belongs to the user
      if (cartItem.cart.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      // Update the cart item
      await ctx.prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity,
          updatedAt: new Date(),
        },
      });

      // Return updated cart
      return ctx.prisma.cart.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isDefault: true },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
        },
      });
    }),

  // Remove an item from the cart
  removeItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { cartItemId } = input;

      // Find the cart item
      const cartItem = await ctx.prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true },
      });

      if (!cartItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart item not found",
        });
      }

      // Check if the cart belongs to the user
      if (cartItem.cart.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      // Delete the cart item
      await ctx.prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      // Return updated cart
      return ctx.prisma.cart.findUnique({
        where: { userId: ctx.session.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isDefault: true },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
        },
      });
    }),

  // Clear the cart
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    // Find the user's cart
    const cart = await ctx.prisma.cart.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!cart) {
      return { success: true };
    }

    // Delete all items in the cart
    await ctx.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { success: true };
  }),
});
