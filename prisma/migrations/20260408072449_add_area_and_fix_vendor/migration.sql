-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "state" TEXT,
    "pincode" TEXT NOT NULL,
    "deliveryCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "pincodeDataId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);
