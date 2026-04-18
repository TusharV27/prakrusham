const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const prods = await prisma.product.findMany({
    where: { isRecommendation: true },
    select: { id: true, name: true, status: true, isRecommendation: true }
  });
  console.log(JSON.stringify(prods, null, 2));
}

check().finally(() => prisma.$disconnect());
