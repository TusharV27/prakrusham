import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst();
  const warehouse = await prisma.warehouse.findFirst();
  console.log('PRODUCT_ID:', product ? product.id : 'NONE');
  console.log('WAREHOUSE_ID:', warehouse ? warehouse.id : 'NONE');
}

main().catch(console.error).finally(() => prisma.$disconnect());
