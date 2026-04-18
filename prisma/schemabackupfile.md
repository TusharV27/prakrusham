// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- Roles and Auth ---
enum Role {
  ADMIN
  CUSTOMER
  FARMER  
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String // Hashed password
  role          Role      @default(CUSTOMER)
  name          String?
  nameHi        String?   // Hindi
  nameGu        String?   // Gujarati
  phone         String?   @unique
  status        String    @default("active") // "active", "inactive", "pending"
  profileImage  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  customer      Customer?
  farmer        Farmer?
  reviews       Review[] // Reviews written by this user
}

// --- Customer Data (India-centric) ---
model Customer {
  id        String    @id @default(cuid())
  userId    String    @unique
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  addresses Address[]
  orders    Order[]
}

model Address {
  id           String   @id @default(cuid())
  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  type         String   @default("Home") // Home, Work, etc.
  fullName     String
  phoneNumber  String
  addressLine1 String
  addressLine2 String?
  landmark     String?
  pincode      String
  city         String
  state        String
  isDefault    Boolean  @default(false)
}

// --- Farmer Module ---
model Farmer {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  landSize     Float? // Land size in acres/hectares
  farmDetails   String?
  farmDetailsHi String? // Hindi
  farmDetailsGu String? // Gujarati
  images       Image[] // Farmer/Farm gallery
  products     Product[] // Products supplied by this farmer
  reviews      Review[] @relation("FarmerReviews")
}

// --- Vendor Module (Standalone User-like Entity) ---
model Vendor {
  id             String           @id @default(cuid())
  email          String           @unique
  password       String // Hashed password
  name           String?
  phone          String?          @unique
  profileImage   String?
  businessName   String           @unique // Formerly storeName
  description    String?
  logo           String?
  commissionRate Float            @default(0.0) // Commission percentage for the vendor
  serviceArea    String?          // The area/region this vendor manages
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  // Relationships
  productRequests ProductRequest[]
  products       Product[]
  images         Image[]
  reviews        Review[]         @relation("VendorReviews")
}

// --- Vendor Product Requests ---
model ProductRequest {
  id          String        @id @default(cuid())
  vendorId    String
  vendor      Vendor        @relation(fields: [vendorId], references: [id])
  productId   String
  product     Product       @relation(fields: [productId], references: [id])
  quantity    Int
  status      RequestStatus @default(PENDING)
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  FULFILLED
}

// --- Product Module (Shopify-style) ---
model Product {
  id             String      @id @default(cuid())
  name           String
  slug           String      @unique
  shortDesc      String?
  description    String?
  price          Float
  compareAtPrice Float?
  costPerItem    Float?
  sku            String?     @unique
  barcode        String?
  weight         Float? // For shipping
  isTaxable      Boolean     @default(true)
  status         ProductStatus @default(DRAFT)
  
  // Categorization
  categoryId     String?
  category       Category?   @relation(fields: [categoryId], references: [id])
  
  // Organization
  vendorId       String?
  vendor         Vendor?     @relation(fields: [vendorId], references: [id])
  farmerId       String?
  farmer         Farmer?     @relation(fields: [farmerId], references: [id])
  
  // Relationships
  productRequests ProductRequest[]
  inventoryItems InventoryItem[]
  
  // Media
  images         Image[]
  
  // Offers
  offers         Offer[]
  
  reviews        Review[]    @relation("ProductReviews")
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  orderItems     OrderItem[]
}

enum ProductStatus {
  ACTIVE
  DRAFT
  ARCHIVED
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  products    Product[]
}

// --- Warehouse & Inventory Management ---
model Warehouse {
  id             String    @id @default(cuid())
  name           String
  locationName   String?
  pincode        String
  address        String?
  images         Image[]
  inventoryItems InventoryItem[]
}

model InventoryItem {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  warehouseId String
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  quantity    Int       @default(0)
  updatedAt   DateTime  @updatedAt

  @@unique([productId, warehouseId])
}

// --- Location Database (Pincodes) ---
model PincodeData {
  id       String @id @default(cuid())
  pincode  String @unique
  district String
  state    String
  city     String
  area     String?
}

// --- Service Areas ---
model Area {
  id              String   @id @default(cuid())
  areaName        String
  city            String
  district        String?
  state           String?
  pincode         String
  deliveryCharge  Float    @default(0)
  minOrderAmount  Float    @default(0)
  status          String   @default("active")
  pincodeDataId   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// --- Offers ---
model Offer {
  id           String    @id @default(cuid())
  name         String
  description  String?
  discountType DiscountType
  value        Float
  startTime    DateTime
  endTime      DateTime
  products     Product[]
  isActive     Boolean   @default(true)
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

// --- Events ---
model Event {
  id              String   @id @default(cuid())
  title           String
  titleHi         String?
  titleGu         String?
  shortDesc       String
  shortDescHi     String?
  shortDescGu     String?
  description     String
  descriptionHi   String?
  descriptionGu   String?
  date            DateTime
  location        String?
  locationHi      String?
  locationGu      String?
  images          Image[]
  createdAt       DateTime @default(now())
}

// --- Reviews (Polymorphic-like) ---
model Review {
  id          String   @id @default(cuid())
  rating      Int
  comment     String?
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  // Target of review
  productId   String?
  product     Product? @relation("ProductReviews", fields: [productId], references: [id])
  vendorId    String?
  vendor      Vendor?  @relation("VendorReviews", fields: [vendorId], references: [id])
  farmerId    String?
  farmer      Farmer?  @relation("FarmerReviews", fields: [farmerId], references: [id])
  
  createdAt   DateTime @default(now())
}

// --- Unified Gallery / Image System ---
model Image {
  id          String     @id @default(cuid())
  url         String
  altText     String?
  
  // Optional relations
  productId   String?
  product     Product?   @relation(fields: [productId], references: [id])
  farmerId    String?
  farmer      Farmer?    @relation(fields: [farmerId], references: [id])
  eventId     String?
  event       Event?     @relation(fields: [eventId], references: [id])
  warehouseId String?
  warehouse   Warehouse? @relation(fields: [warehouseId], references: [id])
  vendorId    String?
  vendor      Vendor?    @relation(fields: [vendorId], references: [id])

  createdAt   DateTime   @default(now())
}

// --- Multi Language Support ---
model Translation {
  id          String   @id @default(cuid())
  language    String // e.g., "hi", "en", "mr"
  key         String // The identifier/key to translate
  value       String // The actual translated content
  context     String? // e.g., "PRODUCT_NAME", "EVENT_DESC"
  targetId    String? // ID of the model being translated
}

// --- Basic E-commerce Order (Simplified) ---
model Order {
  id         String      @id @default(cuid())
  customerId String
  customer   Customer    @relation(fields: [customerId], references: [id])
  total      Float
  status     OrderStatus @default(PENDING)
  items      OrderItem[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float   // Price at the time of purchase
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
