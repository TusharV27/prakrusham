-- CreateTable "MetafieldDefinition"
CREATE TABLE "MetafieldDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "quantity" TEXT NOT NULL DEFAULT 'ONE',
    "namespace" TEXT NOT NULL DEFAULT 'custom',
    "key" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetafieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetafieldDefinition_ownerType_namespace_key_key" ON "MetafieldDefinition"("ownerType", "namespace", "key");

-- CreateTable "MetaobjectDefinition"
CREATE TABLE "MetaobjectDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaobjectDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetaobjectDefinition_name_key" ON "MetaobjectDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MetaobjectDefinition_type_key" ON "MetaobjectDefinition"("type");

-- CreateTable "MetaobjectField"
CREATE TABLE "MetaobjectField" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" TEXT NOT NULL DEFAULT 'ONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaobjectField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaobjectField_definitionId_idx" ON "MetaobjectField"("definitionId");

-- CreateTable "Metaobject"
CREATE TABLE "Metaobject" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metaobject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Metaobject_definitionId_handle_key" ON "Metaobject"("definitionId", "handle");

-- AddForeignKey
ALTER TABLE "MetaobjectField" ADD CONSTRAINT "MetaobjectField_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "MetaobjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metaobject" ADD CONSTRAINT "Metaobject_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "MetaobjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
