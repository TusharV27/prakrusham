import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const start = Date.now();
    const counts = await Promise.all([
        prisma.product.count(),
        prisma.inventoryItem.count(),
        prisma.order.count(),
        prisma.user.count(),
        prisma.farmer.count(),
        prisma.vendor.count()
    ]);
    const end = Date.now();
    console.log('COUNTS:', counts);
    console.log('TIME TAKEN:', end - start, 'ms');
}
main().catch(console.error).finally(() => prisma.$disconnect());
