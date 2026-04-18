/*
  Warnings:

  - The `addressLine2` column on the `Address` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `landmark` column on the `Address` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `district` column on the `Area` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `state` column on the `Area` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `location` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `farmDetailsGu` on the `Farmer` table. All the data in the column will be lost.
  - You are about to drop the column `farmDetailsHi` on the `Farmer` table. All the data in the column will be lost.
  - The `farmDetails` column on the `Farmer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `altText` column on the `Image` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Offer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `shortDesc` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `comment` column on the `Review` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `nameGu` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nameHi` on the `User` table. All the data in the column will be lost.
  - The `name` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `name` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `serviceArea` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locationName` column on the `Warehouse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `address` column on the `Warehouse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `MetaobjectField` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,warehouseId,variantId]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessSlug]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `fullName` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `addressLine1` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `city` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `state` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `areaName` on the `Area` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `city` on the `Area` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `Category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `title` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `shortDesc` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `description` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `Offer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Translation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessSlug` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `businessName` on the `Vendor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `Warehouse` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('FLAT', 'WEIGHT_BASED');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "DiscountType" ADD VALUE 'COMBO';

-- DropForeignKey
ALTER TABLE "MetaobjectField" DROP CONSTRAINT "MetaobjectField_definitionId_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "InventoryItem_productId_warehouseId_key";

-- DropIndex
DROP INDEX "MetaobjectDefinition_name_key";

-- DropIndex
DROP INDEX "Vendor_businessName_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "fullName",
ADD COLUMN     "fullName" JSONB NOT NULL,
DROP COLUMN "addressLine1",
ADD COLUMN     "addressLine1" JSONB NOT NULL,
DROP COLUMN "addressLine2",
ADD COLUMN     "addressLine2" JSONB,
DROP COLUMN "landmark",
ADD COLUMN     "landmark" JSONB,
DROP COLUMN "city",
ADD COLUMN     "city" JSONB NOT NULL,
DROP COLUMN "state",
ADD COLUMN     "state" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Area" DROP COLUMN "areaName",
ADD COLUMN     "areaName" JSONB NOT NULL,
DROP COLUMN "city",
ADD COLUMN     "city" JSONB NOT NULL,
DROP COLUMN "district",
ADD COLUMN     "district" JSONB,
DROP COLUMN "state",
ADD COLUMN     "state" JSONB;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "displayImage" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "slug" TEXT,
DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL,
DROP COLUMN "shortDesc",
ADD COLUMN     "shortDesc" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL,
DROP COLUMN "location",
ADD COLUMN     "location" JSONB;

-- AlterTable
ALTER TABLE "Farmer" DROP COLUMN "farmDetailsGu",
DROP COLUMN "farmDetailsHi",
DROP COLUMN "farmDetails",
ADD COLUMN     "farmDetails" JSONB;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "offerId" TEXT,
DROP COLUMN "altText",
ADD COLUMN     "altText" JSONB;

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "showInHero" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT 'temporary-slug',
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "carrierName" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shippingCharge" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "shippingMethodName" TEXT,
ADD COLUMN     "subtotal" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isRecommendation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metaDescription" JSONB,
ADD COLUMN     "metaTitle" JSONB,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "shippingProfileId" TEXT,
ADD COLUMN     "tags" TEXT,
ADD COLUMN     "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "shortDesc",
ADD COLUMN     "shortDesc" JSONB,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "comment",
ADD COLUMN     "comment" JSONB;

-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "nameGu",
DROP COLUMN "nameHi",
DROP COLUMN "name",
ADD COLUMN     "name" JSONB;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "businessSlug" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
DROP COLUMN "name",
ADD COLUMN     "name" JSONB,
DROP COLUMN "businessName",
ADD COLUMN     "businessName" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB,
DROP COLUMN "serviceArea",
ADD COLUMN     "serviceArea" JSONB;

-- AlterTable
ALTER TABLE "Warehouse" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "locationName",
ADD COLUMN     "locationName" JSONB,
DROP COLUMN "address",
ADD COLUMN     "address" JSONB;

-- DropTable
DROP TABLE "MetaobjectField";

-- CreateTable
CREATE TABLE "ShippingProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingZone" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countries" JSONB NOT NULL,
    "states" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RateType" NOT NULL DEFAULT 'FLAT',
    "price" DOUBLE PRECISION NOT NULL,
    "minWeight" DOUBLE PRECISION DEFAULT 0,
    "maxWeight" DOUBLE PRECISION,
    "minPrice" DOUBLE PRECISION DEFAULT 0,
    "maxPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalDeliverySetting" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "deliveryRadius" DOUBLE PRECISION DEFAULT 10,
    "minOrderAmount" DOUBLE PRECISION DEFAULT 0,
    "deliveryCharge" DOUBLE PRECISION DEFAULT 0,
    "pincodes" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalDeliverySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalPickupSetting" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "locationName" TEXT,
    "instructions" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalPickupSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'in',
    "weightUnit" TEXT NOT NULL DEFAULT 'lb',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMetafield" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductMetafield_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "costPerItem" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION DEFAULT 0.0,
    "taxRate" DOUBLE PRECISION DEFAULT 0.0,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "handle" TEXT NOT NULL,
    "description" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaDescription" JSONB,
    "metaTitle" JSONB,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "handle" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "tags" TEXT,
    "image" TEXT,
    "metaTitle" JSONB,
    "metaDescription" JSONB,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bodyHtml" JSONB NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "imageAlt" JSONB,
    "summaryHtml" JSONB,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaTitle" JSONB,
    "metaDescription" JSONB,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaobjectFieldDefinition" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "quantity" TEXT NOT NULL DEFAULT 'ONE',

    CONSTRAINT "MetaobjectFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingProfile_name_key" ON "ShippingProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMetafield_productId_namespace_key_key" ON "ProductMetafield"("productId", "namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_handle_key" ON "Blog"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Article_handle_key" ON "Article"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "Cart"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_key" ON "CartItem"("cartId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_key" ON "Wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_sessionId_key" ON "Wishlist"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOtp_phone_key" ON "UserOtp"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSetting_key_key" ON "StoreSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_productId_warehouseId_variantId_key" ON "InventoryItem"("productId", "warehouseId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_slug_key" ON "Offer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_businessSlug_key" ON "Vendor"("businessSlug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shippingProfileId_fkey" FOREIGN KEY ("shippingProfileId") REFERENCES "ShippingProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingZone" ADD CONSTRAINT "ShippingZone_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ShippingProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ShippingZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMetafield" ADD CONSTRAINT "ProductMetafield_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaobjectFieldDefinition" ADD CONSTRAINT "MetaobjectFieldDefinition_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "MetaobjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
