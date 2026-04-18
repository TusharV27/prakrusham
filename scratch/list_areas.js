const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const areas = await prisma.area.findMany({
    select: {
      areaName: true,
      pincode: true,
      city: true
    }
  });
  console.log(JSON.stringify(areas, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
