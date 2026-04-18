const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAmroli() {
  const amroli = await prisma.area.create({
    data: {
      pincode: '394107',
      deliveryCharge: 0,
      minOrderAmount: 0,
      status: 'active',
      areaName: { en: 'Amroli', hi: 'अमरोली', gu: 'અમરોલી' },
      city: { en: 'Surat', hi: 'सूरत', gu: 'सूरत' },
      district: { en: 'Surat', hi: 'सूरत', gu: 'सूरत' },
      state: { en: 'Gujarat', hi: 'गुजरात', gu: 'गुजरात' }
    }
  });
  
  console.log('Amroli added successfully:', amroli.id);
}

addAmroli()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
