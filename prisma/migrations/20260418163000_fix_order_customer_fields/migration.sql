-- Bring `Order` table in sync with `prisma/schema.prisma`
-- - `customerName` / `customerPhone` are used during checkout
-- - `customerId` is optional (guest checkout)

ALTER TABLE "Order" ADD COLUMN "customerName" TEXT;
ALTER TABLE "Order" ADD COLUMN "customerPhone" TEXT;

-- Allow guest checkout orders without a Customer row
ALTER TABLE "Order" ALTER COLUMN "customerId" DROP NOT NULL;

