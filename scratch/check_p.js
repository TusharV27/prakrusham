import prisma from '../lib/prisma.js';

async function main() {
  const p = await prisma.product.findFirst();
  console.log('Product Name:', p.name);
  console.log('Product Price:', p.price);
  await prisma.$disconnect();
}
main();
