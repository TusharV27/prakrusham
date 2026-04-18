-- Add Order.orderNumber used for human-readable order IDs (e.g. "#1000")
ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;

-- Nullable + unique: allows existing rows without order numbers, enforces uniqueness when present.
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
