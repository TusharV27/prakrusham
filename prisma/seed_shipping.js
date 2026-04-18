import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding shipping data...');

  // 1. Create/Update General Shipping Profile
  const generalProfile = await prisma.shippingProfile.upsert({
    where: { name: 'General Profile' },
    update: { isDefault: true },
    create: {
      name: 'General Profile',
      isDefault: true,
    },
  });

  console.log('General Shipping Profile created/updated.');

  // 2. Create Domestic India Zone
  const indiaZone = await prisma.shippingZone.upsert({
    where: { 
        // Since there's no unique constraint on name+profileId, we'll find or create
        id: (await prisma.shippingZone.findFirst({ 
            where: { profileId: generalProfile.id, name: 'Domestic India' } 
        }))?.id || 'dynamic-india-zone-id'
    },
    update: {
        countries: ['India'],
        states: [], // Empty means all states
        isActive: true,
    },
    create: {
      profileId: generalProfile.id,
      name: 'Domestic India',
      countries: ['India'],
      states: [],
      isActive: true,
    },
  });

  console.log('Domestic India Zone created/updated.');

  // 3. Create Shipping Rates
  const rates = [
    {
      name: 'Standard Shipping',
      type: 'FLAT',
      price: 99,
      minPrice: 0,
      maxPrice: 999.99,
    },
    {
      name: 'Free Shipping',
      type: 'FLAT',
      price: 0,
      minPrice: 1000,
      maxPrice: null,
    },
  ];

  for (const rate of rates) {
    const existingRate = await prisma.shippingRate.findFirst({
        where: { zoneId: indiaZone.id, name: rate.name }
    });

    if (existingRate) {
        await prisma.shippingRate.update({
            where: { id: existingRate.id },
            data: rate
        });
    } else {
        await prisma.shippingRate.create({
            data: {
                ...rate,
                zoneId: indiaZone.id,
            }
        });
    }
  }

  console.log('Shipping rates created/updated.');

  // 4. Local Delivery Settings
  await prisma.localDeliverySetting.deleteMany({}); // Reset for clean seed
  await prisma.localDeliverySetting.create({
    data: {
        isActive: true,
        deliveryRadius: 10,
        minOrderAmount: 200,
        deliveryCharge: 40,
        pincodes: ['395006', '380001', '395007'], // Sample Gujarat pincodes
    }
  });

  console.log('Local Delivery settings updated.');

  // 5. Local Pickup Settings
  await prisma.localPickupSetting.deleteMany({});
  await prisma.localPickupSetting.create({
    data: {
        isActive: true,
        locationName: 'Prakrushi Surat Hub',
        instructions: 'Pickup from the main gate between 10 AM to 6 PM.',
    }
  });

  console.log('Local Pickup settings updated.');

  // 6. Sample Pincode Data (to test state lookup)
  const pincodes = [
    { pincode: '395006', district: 'Surat', state: 'Gujarat', city: 'Surat' },
    { pincode: '400001', district: 'Mumbai', state: 'Maharashtra', city: 'Mumbai' },
    { pincode: '110001', district: 'Central Delhi', state: 'Delhi', city: 'Delhi' },
  ];

  for (const pin of pincodes) {
    await prisma.pincodeData.upsert({
        where: { pincode: pin.pincode },
        update: pin,
        create: pin,
    });
  }

  console.log('Sample Pincode data seeded.');

  // 7. Assign General Profile to all existing products
  const products = await prisma.product.findMany();
  for (const product of products) {
      await prisma.product.update({
          where: { id: product.id },
          data: { shippingProfileId: generalProfile.id }
      });
  }
  
  if (products.length > 0) {
      console.log(`Assigned General Profile to ${products.length} products.`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
