-- Enable RLS
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

-- Product policies
CREATE POLICY "Products are viewable by everyone"
  ON "Product"
  FOR SELECT
  USING (true);

CREATE POLICY "Products are editable by authenticated users only"
  ON "Product"
  FOR ALL
  USING (current_user IS NOT NULL)
  WITH CHECK (current_user IS NOT NULL);

-- Order policies
CREATE POLICY "Users can view their own orders"
  ON "Order"
  FOR SELECT
  USING ("userId"::uuid = (current_setting('request.jwt.claims')::json->>'sub')::uuid);

CREATE POLICY "Users can create their own orders"
  ON "Order"
  FOR INSERT
  WITH CHECK ("userId"::uuid = (current_setting('request.jwt.claims')::json->>'sub')::uuid);

CREATE POLICY "Users can update their own orders"
  ON "Order"
  FOR UPDATE
  USING ("userId"::uuid = (current_setting('request.jwt.claims')::json->>'sub')::uuid)
  WITH CHECK ("userId"::uuid = (current_setting('request.jwt.claims')::json->>'sub')::uuid);

-- OrderItem policies
CREATE POLICY "Users can view their order items"
  ON "OrderItem"
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order"."id" = "OrderItem"."orderId"
    AND "Order"."userId"::uuid = (current_setting('request.jwt.claims')::json->>'sub')::uuid
  ));

CREATE POLICY "Users can create order items for their orders"
  ON "OrderItem"
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order"."id" = "OrderItem"."orderId"
    AND "Order"."userId"::uuid = (current_setting('request.jwt.claims')::json->>'sub')::uuid
  ));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "product_isactive_idx" ON "Product"("isActive");
CREATE INDEX IF NOT EXISTS "order_userid_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "order_createdat_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "orderitem_orderid_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "orderitem_productid_idx" ON "OrderItem"("productId"); 