import 'dotenv/config';
import prisma from '../lib/prisma.js';
import { hashPassword } from '../lib/auth.js';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@prakrushi.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123';
  const hashedPassword = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: { en: 'Prakrushi Admin', hi: 'प्रकृति एडमिन', gu: 'પ્રકૃતિ એડમિન' },
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      name: { en: 'Prakrushi Admin', hi: 'प्रकृति एडमिन', gu: 'પ્રકૃતિ એડમિન' },
    },
  });

  console.log(`Default admin seeded: ${admin.email}`);

  // Seed Categories
  const categories = [
    {
      name: { en: 'Vegetables', hi: 'सब्जियां', gu: 'શાકભાજી' },
      slug: 'vegetables',
      description: { en: 'Fresh organic vegetables', hi: 'ताज़ी जैविक सब्जियां', gu: 'તાજી ઓર્ગેનિક શાકભાજી' },
    },
    {
      name: { en: 'Fruits', hi: 'फल', gu: 'ફળો' },
      slug: 'fruits',
      description: { en: 'Sweet seasonal fruits', hi: 'मीठे मौसमी फल', gu: 'મીઠા મોસમી ફળો' },
    },
    {
      name: { en: 'Grains', hi: 'अनाज', gu: 'અનાજ' },
      slug: 'grains',
      description: { en: 'Nutritious grains and pulses', hi: 'पौष्टिक अनाज और दालें', gu: 'પૌષ્ટિક અનાજ અને કઠોળ' },
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  console.log('Default categories seeded');

  // Seed a Farmer
  const farmerUser = await prisma.user.upsert({
    where: { email: 'farmer@prakrushi.com' },
    update: {},
    create: {
      email: 'farmer@prakrushi.com',
      password: hashedPassword,
      role: 'FARMER',
      name: { en: 'Farmer John', hi: 'किसान जॉन', gu: 'ખેડૂત જોન' },
    },
  });

  await prisma.farmer.upsert({
    where: { userId: farmerUser.id },
    update: {},
    create: {
      userId: farmerUser.id,
      landSize: 10,
      farmDetails: { en: 'Green Valley Farm', hi: 'ग्रीन वैली फार्म', gu: 'ગ્રીન વેલી ફાર્મ' },
    },
  });

  console.log('Test farmer seeded');

  // Seed a Vendor
  await prisma.vendor.upsert({
    where: { email: 'vendor@prakrushi.com' },
    update: {},
    create: {
      email: 'vendor@prakrushi.com',
      password: hashedPassword,
      name: { en: 'Organic Vendor', hi: 'जैविक विक्रेता', gu: 'ઓર્ગેનિક વેન્ડર' },
      businessName: { en: 'Organic Store', hi: 'जैविक स्टोर', gu: 'ઓર્ગેનિક સ્ટોર' },
      businessSlug: 'organic-store',
    },
  });

  console.log('Test vendor seeded');
  console.log('Use ADMIN_EMAIL and ADMIN_PASSWORD environment variables to override the default credentials.');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
