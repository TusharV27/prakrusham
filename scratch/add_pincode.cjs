const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPincode() {
  try {
    const a = await prisma.area.create({
      data: {
        pincode: '395004',
        deliveryCharge: 0,
        minOrderAmount: 0,
        status: 'active',
        areaName: { en: 'Amroli', hi: 'अमરોલી', gu: 'અમરોલી' },
        city: { en: 'Surat', hi: 'सूरत', gu: 'સૂરત' },
        district: { en: 'Surat', hi: 'सूरत', gu: 'સૂરત' },
        state: { en: 'Gujarat', hi: 'गुजरात', gu: 'ગુજરાત' }
      }
    });
    console.log('ADDED 395004:', a.id);
  } catch (e) {
    console.log('Skipping 395004 (Likely already exists or error):', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

addPincode();
