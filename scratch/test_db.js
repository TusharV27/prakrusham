
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Fetching products...');
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        category: { select: { name: true } }
      }
    });
    console.log('Success! Found', products.length, 'products');
    console.log('Sample:', JSON.stringify(products[0], null, 2));
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
