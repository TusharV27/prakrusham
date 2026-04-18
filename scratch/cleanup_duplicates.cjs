const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Starting cart cleanup...");
  
  // 1. Find all duplicates
  const duplicates = await prisma.$queryRaw`
    SELECT "cartId", "productId", "variantId"
    FROM "CartItem"
    GROUP BY "cartId", "productId", "variantId"
    HAVING COUNT(*) > 1
  `;

  console.log("Found " + duplicates.length + " sets of duplicates.");

  for (const group of duplicates) {
    const { cartId, productId, variantId } = group;
    
    // Find all items in this group
    const items = await prisma.cartItem.findMany({
      where: {
        cartId: cartId,
        productId: productId,
        variantId: variantId || null
      },
      orderBy: { createdAt: 'asc' }
    });

    if (items.length <= 1) continue;

    const first = items[0];
    const rest = items.slice(1);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    console.log("Merging " + items.length + " items for product " + productId + ". Total quantity: " + totalQuantity);

    // Update the first one
    await prisma.cartItem.update({
      where: { id: first.id },
      data: { quantity: totalQuantity }
    });

    // Delete the rest
    await prisma.cartItem.deleteMany({
      where: {
        id: { in: rest.map(i => i.id) }
      }
    });
  }

  console.log("Cleanup complete!");
}

cleanup()
  .catch(e => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
