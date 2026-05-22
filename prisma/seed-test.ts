import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { testFixtures } from "./test-fixtures";

async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  const fixtureSlugs = [
    testFixtures.availableProduct.slug,
    testFixtures.unavailableProduct.slug,
  ];

  try {
    await prisma.product.deleteMany({
      where: { slug: { in: fixtureSlugs } },
    });

    const category = await prisma.category.upsert({
      where: { slug: testFixtures.category.slug },
      update: { name: testFixtures.category.name },
      create: testFixtures.category,
    });

    await prisma.product.createMany({
      data: [
        {
          ...testFixtures.availableProduct,
          categoryId: category.id,
        },
        {
          ...testFixtures.unavailableProduct,
          categoryId: category.id,
        },
      ],
    });
  } finally {
    await prisma.$disconnect();
  }
}

main();
