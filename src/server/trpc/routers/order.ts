import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

export const orderRouter = createTRPCRouter({
  // Get order history for current user
  getMyOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional(),
        status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;
      const status = input?.status;

      const orders = await ctx.prisma.order.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          userId: ctx.session.user.id,
          ...(status && { status }),
        },
        orderBy: {
          createdAt: "desc",
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
            },
            take: 3, // Only include first few items in the overview
          },
          _count: {
            select: {
              items: true,
            },
          },
          shippingAddress: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: orders,
        nextCursor,
      };
    }),

  // Get a specific order by ID
  getOrderById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const order = await ctx.prisma.order.findUnique({
        where: { id },
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
          shippingAddress: true,
          billingAddress: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if the order belongs to the current user
      if (order.userId !== ctx.session.user.id && ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      return order;
    }),

  // Create an order from the current cart
  createOrder: protectedProcedure
    .input(
      z.object({
        shippingAddressId: z.string(),
        billingAddressId: z.string().optional(), // If not provided, use shipping address
        paymentIntentId: z.string().optional(), // For external payment processing
        notes: z.string().optional(),
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { shippingAddressId, billingAddressId, paymentIntentId, notes, couponCode } = input;
      const userId = ctx.session.user.id;

      // Check if user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }

      // Check if shipping address exists and belongs to user
      const shippingAddress = await ctx.prisma.address.findUnique({
        where: { id: shippingAddressId },
      });

      if (!shippingAddress || shippingAddress.userId !== userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid shipping address",
        });
      }

      // Check if billing address exists and belongs to user (if provided)
      if (billingAddressId) {
        const billingAddress = await ctx.prisma.address.findUnique({
          where: { id: billingAddressId },
        });

        if (!billingAddress || billingAddress.userId !== userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid billing address",
          });
        }
      }

      // Get user's cart
      const cart = await ctx.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Check if products and variants exist and are in stock
      for (const item of cart.items) {
        const product = item.product;
        const variant = item.variant;

        if (!product.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Product "${product.name}" is no longer available`,
          });
        }

        // Check inventory
        const inventory = variant ? variant.inventory : product.inventory;
        if (inventory < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Not enough inventory for "${product.name}"`,
          });
        }
      }

      // Calculate order totals
      let subTotal = 0;
      for (const item of cart.items) {
        const price = item.variant?.price ?? item.product.price;
        subTotal += price * item.quantity;
      }

      // Apply discount if coupon is valid (implement coupon logic here)
      const discount = 0; // For now, no discount

      // Calculate tax (example: 10% tax rate)
      const taxRate = 0.1;
      const tax = subTotal * taxRate;

      // Calculate shipping (example: flat $5 shipping rate)
      const shipping = 5;

      // Calculate total
      const total = subTotal + tax + shipping - discount;

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create the order in a transaction
      const order = await ctx.prisma.$transaction(async (prisma) => {
        // Create the order
        const newOrder = await prisma.order.create({
          data: {
            orderNumber,
            userId,
            status: "PENDING",
            subTotal,
            tax,
            shipping,
            discount,
            total,
            shippingAddressId,
            billingAddressId: billingAddressId || shippingAddressId, // Use shipping address if billing not provided
            notes,
            couponCode,
            paymentIntentId,
            paymentStatus: paymentIntentId ? "PAID" : "PENDING",
          },
        });

        // Create order items from cart items
        await Promise.all(
          cart.items.map(async (cartItem) => {
            const price = cartItem.variant?.price ?? cartItem.product.price;
            const itemTotal = price * cartItem.quantity;

            await prisma.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: cartItem.productId,
                variantId: cartItem.variantId ?? null,
                quantity: cartItem.quantity,
                price,
                total: itemTotal,
                name: cartItem.product.name,
                sku: cartItem.variant?.sku ?? cartItem.product.sku,
                variantName: cartItem.variant?.name ?? null,
              },
            });

            // Update inventory
            if (cartItem.variantId) {
              await prisma.productVariant.update({
                where: { id: cartItem.variantId },
                data: {
                  inventory: {
                    decrement: cartItem.quantity,
                  },
                },
              });
            } else {
              await prisma.product.update({
                where: { id: cartItem.productId },
                data: {
                  inventory: {
                    decrement: cartItem.quantity,
                  },
                },
              });
            }
          })
        );

        // Clear the cart
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return newOrder;
      });

      // Return the created order
      return ctx.prisma.order.findUnique({
        where: { id: order.id },
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
          shippingAddress: true,
          billingAddress: true,
        },
      });
    }),

  // Cancel an order (if it's in PENDING or PROCESSING state)
  cancelOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session.user.id;

      // Get the order
      const order = await ctx.prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if the order belongs to the current user
      if (order.userId !== userId && ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      // Check if the order can be cancelled
      if (order.status !== "PENDING" && order.status !== "PROCESSING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order cannot be cancelled at this stage",
        });
      }

      // Update order status
      const updatedOrder = await ctx.prisma.$transaction(async (prisma) => {
        // Update order status
        const updated = await prisma.order.update({
          where: { id },
          data: {
            status: "CANCELLED",
          },
        });

        // Restore inventory for each order item
        for (const item of order.items) {
          if (item.variantId) {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: {
                inventory: {
                  increment: item.quantity,
                },
              },
            });
          } else {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                inventory: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        return updated;
      });

      return updatedOrder;
    }),

  // Admin: Get all orders with filtering options
  getAllOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
        cursor: z.string().optional(),
        status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
        search: z.string().optional(), // search by order number or customer name
        sortBy: z.enum(["orderNumber", "createdAt", "total"]).optional().default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin or staff
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "STAFF") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { limit, cursor, status, search, sortBy, sortOrder } = input;

      const orders = await ctx.prisma.order.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...(status && { status }),
          ...(search && {
            OR: [
              { orderNumber: { contains: search } },
              {
                user: {
                  OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                  ],
                },
              },
            ],
          }),
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: orders,
        nextCursor,
      };
    }),

  // Admin: Update order status
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin or staff
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "STAFF") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { id, status } = input;

      // Get the order
      const order = await ctx.prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Special logic for cancellation and refunds
      if (status === "CANCELLED" || status === "REFUNDED") {
        // For cancellation or refund, need to restore inventory
        if (order.status !== "CANCELLED" && order.status !== "REFUNDED") {
          return ctx.prisma.$transaction(async (prisma) => {
            // Update order status
            const updatedOrder = await prisma.order.update({
              where: { id },
              data: { status },
            });

            // Get order items
            const orderItems = await prisma.orderItem.findMany({
              where: { orderId: id },
            });

            // Restore inventory for each order item
            for (const item of orderItems) {
              if (item.variantId) {
                await prisma.productVariant.update({
                  where: { id: item.variantId },
                  data: {
                    inventory: {
                      increment: item.quantity,
                    },
                  },
                });
              } else {
                await prisma.product.update({
                  where: { id: item.productId },
                  data: {
                    inventory: {
                      increment: item.quantity,
                    },
                  },
                });
              }
            }

            return updatedOrder;
          });
        }
      }

      // For other status updates, simply update the status
      return ctx.prisma.order.update({
        where: { id },
        data: { status },
      });
    }),
});

// Helper function to generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomUUID().split("-")[0];
  return `ORD-${timestamp}-${random}`;
}
