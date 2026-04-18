const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma connection...');
  try {
    const userCount = await prisma.user.count();
    console.log('Connection successful. User count:', userCount);
    
    // Test a specific user
    const firstUser = await prisma.user.findFirst();
    console.log('First user found:', firstUser ? firstUser.id : 'None');

    // Test Customer creation/find
    if (firstUser) {
        console.log('Testing customer find for user:', firstUser.id);
        const customer = await prisma.customer.findUnique({
            where: { userId: firstUser.id }
        });
        console.log('Customer result:', customer ? 'Found' : 'Not Found');
    }

  } catch (error) {
    console.error('Prisma connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
