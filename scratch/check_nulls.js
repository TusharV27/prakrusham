import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all events...');
  const events = await prisma.event.findMany({
      select: {
          id: true,
          slug: true,
          title: true
      }
  });

  console.log(`Total events: ${events.length}`);
  
  let nullCount = 0;
  for (const event of events) {
    if (event.slug === null || event.slug === undefined) {
      console.log(`Event ${event.id} HAS NULL SLUG! Title:`, JSON.stringify(event.title));
      nullCount++;
    } else {
      console.log(`Event ${event.id} has slug: "${event.slug}"`);
    }
  }

  console.log(`Summary: ${nullCount} null slugs found.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
