import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to create default profile...');
    const defaultProfile = await prisma.shippingProfile.create({
      data: {
        name: 'General',
        isDefault: true
      },
      include: {
        _count: {
          select: { products: true }
        },
        zones: {
          include: {
            rates: true
          }
        }
      }
    });
    console.log('Success:', JSON.stringify(defaultProfile, null, 2));
  } catch (e) {
    console.error('Error Details:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
