const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$executeRawUnsafe(`UPDATE "Offer" SET "slug" = 'summer-20' WHERE "slug" IS NULL`);
        console.log('Migration successful, updated rows:', result);
    } catch (error) {
        // If it fails because the column doesn't exist yet, that's fine, we'll push it with a default
        console.log('Migration skipped or failed (column might not exist):', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
