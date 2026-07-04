import { prisma } from "@/lib/prisma";

export type SortOption = "relevancia" | "menor" | "mayor" | "descuento";

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

export async function getFeaturedProducts(take = 4) {
  return prisma.product.findMany({
    take,
    orderBy: { createdAt: "asc" },
    include: { category: true, brand: true },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true },
  });
}

export async function getFilteredProducts(opts: {
  category?: string;
  brands?: string[];
  search?: string;
  sort?: SortOption;
}) {
  const { category, brands, search, sort = "relevancia" } = opts;

  const products = await prisma.product.findMany({
    where: {
      category: category && category !== "Todas" ? { name: category } : undefined,
      brand: brands && brands.length ? { name: { in: brands } } : undefined,
      ...(search?.trim()
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { category: { name: { contains: search, mode: "insensitive" } } },
              { brand: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { category: true, brand: true },
    orderBy: { createdAt: "asc" },
  });

  const withOff = products.map((p) => ({
    ...p,
    off: p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0,
  }));

  if (sort === "menor") withOff.sort((a, b) => a.price - b.price);
  else if (sort === "mayor") withOff.sort((a, b) => b.price - a.price);
  else if (sort === "descuento") withOff.sort((a, b) => b.off - a.off);

  return withOff;
}

export async function getCategoryCounts() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  return categories;
}
