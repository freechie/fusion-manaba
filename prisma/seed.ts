import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    // Create categories
    const pastries = await prisma.category.upsert({
      where: { slug: "pastries" },
      update: {},
      create: { name: "Pastries", slug: "pastries" },
    });

    const breads = await prisma.category.upsert({
      where: { slug: "breads" },
      update: {},
      create: { name: "Breads", slug: "breads" },
    });

    const cakes = await prisma.category.upsert({
      where: { slug: "cakes" },
      update: {},
      create: { name: "Cakes", slug: "cakes" },
    });

    // Create products
    const products = [
      {
        name: "Empanada de Verde",
        slug: "empanada-de-verde",
        description:
          "Traditional Ecuadorian empanada made with green plantain dough, filled with seasoned cheese.",
        price: 3.5,
        categoryId: pastries.id,
      },
      {
        name: "Bolón de Verde",
        slug: "bolon-de-verde",
        description:
          "A hearty ball of mashed green plantain stuffed with cheese and chicharrón.",
        price: 4.0,
        categoryId: pastries.id,
      },
      {
        name: "Pan de Yuca",
        slug: "pan-de-yuca",
        description:
          "Soft, chewy bread made from yuca flour and fresh cheese. A coastal favorite.",
        price: 2.5,
        categoryId: breads.id,
      },
      {
        name: "Pan de Almidón",
        slug: "pan-de-almidon",
        description:
          "Light and airy bread made from cassava starch, perfect with coffee.",
        price: 2.0,
        categoryId: breads.id,
      },
      {
        name: "Tres Leches",
        slug: "tres-leches",
        description:
          "Classic three-milk cake soaked in a blend of condensed, evaporated, and heavy cream.",
        price: 18.0,
        categoryId: cakes.id,
      },
      {
        name: "Torta de Chocolate",
        slug: "torta-de-chocolate",
        description:
          "Rich chocolate cake made with Ecuadorian cacao, layered with ganache.",
        price: 22.0,
        categoryId: cakes.id,
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      });
    }

    console.log("Seed data created successfully!");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
