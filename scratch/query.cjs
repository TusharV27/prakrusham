const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const areas = await prisma.area.findMany({ take: 3 });
    console.log("AREAS:", JSON.stringify(areas, null, 2));
    
    const customers = await prisma.customer.findMany({ take: 3 });
    console.log("CUSTOMERS:", JSON.stringify(customers, null, 2));

    const addrs = await prisma.address.findMany({ take: 3 });
    console.log("ADDRESSES:", JSON.stringify(addrs, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
