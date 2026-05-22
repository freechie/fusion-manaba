import { db } from "@/lib/db";

export function getAvailableProducts() {
  return db.product.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
}

export function getAvailableProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, isAvailable: true },
    include: { category: true },
  });
}

export function getAvailableProductById(id: number) {
  return db.product.findFirst({
    where: { id, isAvailable: true },
  });
}

export function getAvailableProductsByIds(ids: number[]) {
  return db.product.findMany({
    where: { id: { in: ids }, isAvailable: true },
  });
}
