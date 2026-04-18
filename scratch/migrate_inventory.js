import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrate() {
    console.log('--- STARTING INVENTORY MIGRATION ---');
    
    // 1. Get the first warehouse (Default)
    const warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
        console.error('ERROR: No warehouse found. Please create a warehouse in the Admin panel first.');
        return;
    }
    console.log(`Using Warehouse: ${warehouse.name?.en || 'Default'} (${warehouse.id})`);

    // 2. Get all variants with non-zero legacy quantity
    const variants = await prisma.productVariant.findMany({
        where: {
            quantity: { gt: 0 }
        }
    });
    console.log(`Found ${variants.length} variants with legacy stock.`);

    let migratedCount = 0;

    for (const variant of variants) {
        try {
            // Check if inventory item already exists for this variant-warehouse combo
            const existing = await prisma.inventoryItem.findUnique({
                where: {
                    productId_warehouseId_variantId: {
                        productId: variant.productId,
                        warehouseId: warehouse.id,
                        variantId: variant.id
                    }
                }
            });

            if (!existing) {
                // Migrate to InventoryItem
                await prisma.inventoryItem.create({
                    data: {
                        productId: variant.productId,
                        variantId: variant.id,
                        warehouseId: warehouse.id,
                        quantity: variant.quantity
                    }
                });
                migratedCount++;
                console.log(`Migrated ${variant.quantity} units for variant "${variant.title}" (Product ID: ${variant.productId})`);
            } else {
                console.log(`Skipped variant "${variant.title}" - Inventory record already exists.`);
            }
        } catch (err) {
            console.error(`Failed to migrate variant ${variant.id}:`, err.message);
        }
    }

    console.log(`--- MIGRATION COMPLETE: ${migratedCount} records created ---`);
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
