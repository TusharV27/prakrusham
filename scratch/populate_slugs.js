import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

function generateSlug(text) {
    if (!text) return `event-${Date.now()}`;
    const base = String(text).trim().toLowerCase();
    const slug = base
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
    return slug || `event-${Date.now()}`;
}

async function main() {
  console.log('Fetching events with null slugs...');
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' }
      ]
    }
  });

  console.log(`Found ${events.length} events to update.`);

  for (const event of events) {
    const title = typeof event.title === 'object' ? (event.title?.en || 'event') : (event.title || 'event');
    const slug = generateSlug(title) + '-' + Math.random().toString(36).substring(2, 7);
    
    console.log(`Updating event ${event.id} with slug: ${slug}`);
    await prisma.event.update({
      where: { id: event.id },
      data: { slug: slug }
    });
  }

  console.log('Update complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
