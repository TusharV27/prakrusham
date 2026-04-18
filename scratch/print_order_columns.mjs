import prisma from "../lib/prisma.js";

async function main() {
  const columns = await prisma.$queryRaw`
    SELECT
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Order'
    ORDER BY ordinal_position
  `;

  console.log(columns);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

