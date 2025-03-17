-- Create enum for order status
CREATE TYPE "public"."OrderStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
);

-- Create Product table
CREATE TABLE IF NOT EXISTS "public"."Product" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "image" TEXT,
  "sku" TEXT NOT NULL UNIQUE,
  "inventory" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for Product
CREATE INDEX IF NOT EXISTS "Product_isActive_idx" ON "public"."Product"("isActive");
CREATE INDEX IF NOT EXISTS "Product_sku_idx" ON "public"."Product"("sku");

-- Create Order table
CREATE TABLE IF NOT EXISTS "public"."Order" (
  "id" TEXT PRIMARY KEY,
  "userId" UUID NOT NULL,
  "total" DECIMAL(10, 2) NOT NULL,
  "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "shippingAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes for Order
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "public"."Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "public"."Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "public"."Order"("createdAt");

-- Create OrderItem table
CREATE TABLE IF NOT EXISTS "public"."OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "public"."Product"("id")
);

-- Create indexes for OrderItem
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "public"."OrderItem"("productId");
