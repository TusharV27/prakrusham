const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAmroli() {
  const areas = await prisma.area.findMany();
  console.log('Total Areas:', areas.length);
  areas.forEach(a => {
    console.log(`- ${JSON.stringify(a.areaName)} (${a.pincode})`);
  });
  
  const amroli = areas.find(a => 
    JSON.stringify(a.areaName).toLowerCase().includes('amroli') || 
    a.pincode === '394107'
  );
  
  if (amroli) {
    console.log('Amroli found!');
  } else {
    console.log('Amroli NOT found in database.');
  }
}

checkAmroli()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
