-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "order_createdat_idx" RENAME TO "Order_createdAt_idx";

-- RenameIndex
ALTER INDEX "order_status_idx" RENAME TO "Order_status_idx";

-- RenameIndex
ALTER INDEX "order_userid_idx" RENAME TO "Order_userId_idx";

-- RenameIndex
ALTER INDEX "orderitem_orderid_idx" RENAME TO "OrderItem_orderId_idx";

-- RenameIndex
ALTER INDEX "orderitem_productid_idx" RENAME TO "OrderItem_productId_idx";

-- RenameIndex
ALTER INDEX "product_isactive_idx" RENAME TO "Product_isActive_idx";
