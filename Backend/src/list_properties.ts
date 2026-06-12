import { prisma } from "./db/db.js";

async function main() {
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    }
  });
  console.log("All properties in DB:", JSON.stringify(properties, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
