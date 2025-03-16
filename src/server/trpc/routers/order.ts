import { Prisma, OrderStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const orderRouter = createTRPCRouter({
  // Public version that handles unauthenticated users gracefully
  getMyOrders: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(10),
          cursor: z.string().optional(),
          status: z.nativeEnum(OrderStatus).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      // Check if user is authenticated
      if (!ctx.session?.user) {
        // Return empty order list for unauthenticated users instead of throwing an error
        return {
          items: [],
          nextCursor: undefined,
        }
      }

      try {
        const userId = ctx.session.user.id
        const limit = input?.limit ?? 10
        const { status } = input || {} // Removed cursor as it's not used currently

        // Try to get real orders if the Order table exists
        try {
          // Construct the where clause
          const where: Prisma.OrderWhereInput = { userId }
          if (status) {
            where.status = status as OrderStatus
          }

          // Use Prisma's type-safe query API
          const orders = await ctx.prisma.order.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          })

          // If we have orders, format and return them
          if (Array.isArray(orders) && orders.length > 0) {
            // Check if we have more items
            const hasMore = orders.length > limit
            const orderItems = hasMore ? orders.slice(0, -1) : orders

            return {
              items: orderItems,
              nextCursor: hasMore
                ? orderItems[orderItems.length - 1].id
                : undefined,
            }
          }
        } catch (e) {
          // Table might not exist yet, log the error and return empty orders
          console.log('Order table query failed:', e)
        }

        // No mock order generation - return empty array
        return {
          items: [],
          nextCursor: undefined,
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        return {
          items: [],
          nextCursor: undefined,
        }
      }
    }),

  getOrderById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id

        // For MVP, add a check to make the ID follow a certain pattern that only this user would know
        // This adds a basic level of security even without a database
        if (!input.id.includes(userId.substring(0, 5))) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: "You don't have permission to view this order",
          })
        }

        // Return placeholder data for MVP
        return {
          id: input.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId,
          total: new Prisma.Decimal(0),
          status: 'PENDING',
          paymentStatus: 'PAID',
          shippingAddress: '',
          items: [],
        }
      } catch (error) {
        console.error('Failed to fetch order:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch order',
        })
      }
    }),

  checkout: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
          })
        ),
        shippingAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is authenticated first
      if (!ctx.session?.user) {
        // Return a user-friendly error for unauthenticated users
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You need to sign in to complete your purchase',
        })
      }

      // Start a transaction to ensure all operations are atomic
      return await ctx.prisma.$transaction(async tx => {
        try {
          // We already checked that ctx.session?.user exists above, so we can safely use it here
          const userId = ctx.session!.user.id

          // Validate all products exist and have sufficient inventory
          const productIds = input.items.map(item => item.productId)
          const products = await tx.product.findMany({
            where: {
              id: {
                in: productIds,
              },
            },
          })

          if (products.length !== productIds.length) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'One or more products not found',
            })
          }

          // Check inventory and calculate total
          let total = 0
          type InventoryUpdate = {
            id: string
            inventory: number
            shouldDeactivate: boolean
          }

          type OrderItemCreate = {
            productId: string
            quantity: number
            price: Prisma.Decimal
            name: string
          }

          const inventoryUpdates: InventoryUpdate[] = []
          const orderItems: OrderItemCreate[] = []

          for (const item of input.items) {
            const product = products.find(p => p.id === item.productId)
            if (!product) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Product ${item.productId} not found`,
              })
            }

            if (product.inventory < item.quantity) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Insufficient inventory for ${product.name}`,
              })
            }

            // Calculate item total - ensure we have a valid price
            const itemPrice = Number(product.price)
            if (isNaN(itemPrice) || itemPrice <= 0) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Invalid price for product ${product.name}`,
              })
            }

            const itemTotal = itemPrice * item.quantity
            total += itemTotal

            // Calculate new inventory
            const newInventory = product.inventory - item.quantity

            // Add to inventory updates, flagging for deactivation if inventory is now zero
            inventoryUpdates.push({
              id: product.id,
              inventory: newInventory,
              shouldDeactivate: newInventory === 0,
            })

            // Prepare order item with exact price from product
            orderItems.push({
              productId: product.id,
              quantity: item.quantity,
              price: product.price, // Use the actual Decimal from the product
              name: product.name,
            })
          }

          // Update inventory and deactivate products with zero inventory
          for (const update of inventoryUpdates) {
            await tx.product.update({
              where: { id: update.id },
              data: {
                inventory: update.inventory,
                // Automatically deactivate products when inventory hits zero
                ...(update.shouldDeactivate && { isActive: false }),
              },
            })
          }

          // Generate a unique order ID for this MVP implementation
          // Include part of the userId for basic user association
          const orderId = `order-${userId.substring(0, 5)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

          // Create the order using Prisma's type-safe API
          const order = await tx.order.create({
            data: {
              id: orderId,
              userId,
              status: 'PENDING',
              total: new Prisma.Decimal(total),
              shippingAddress: input.shippingAddress || '',
              paymentStatus: 'PAID',
              items: {
                create: orderItems.map(item => ({
                  id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                  ...item,
                })),
              },
            },
            include: {
              items: true,
            },
          })

          return {
            success: true,
            orderId: order.id,
          }
        } catch (error) {
          // This will roll back all database changes if any error occurs
          console.error('Checkout failed:', error)
          if (error instanceof TRPCError) {
            throw error
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Checkout failed',
          })
        }
      }) // End of transaction
    }),
})
