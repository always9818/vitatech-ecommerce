import { prisma } from "@/lib/prisma";

export type SortOption = "relevancia" | "menor" | "mayor" | "descuento";

/**
 * Los productos ocultos no existen para el cliente. Se aplica en TODO lo que
 * mira la tienda (destacados, catálogo, búsqueda, conteos y la ficha), no solo
 * en el listado: si no, un producto oculto seguiría siendo alcanzable por su
 * enlace directo o apareciendo en los contadores por categoría.
 */
const SOLO_VISIBLES = { visible: true } as const;

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

export async function getFeaturedProducts(take = 4) {
  return prisma.product.findMany({
    take,
    where: SOLO_VISIBLES,
    orderBy: { createdAt: "asc" },
    include: { category: true, brand: true },
  });
}

export async function getProductById(id: string) {
  // `findFirst` y no `findUnique` para poder exigir además que esté visible:
  // así un producto oculto tampoco es alcanzable por su enlace directo, que
  // es justo el que queda guardado en historiales y buscadores.
  return prisma.product.findFirst({
    where: { id, ...SOLO_VISIBLES },
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
      ...SOLO_VISIBLES,
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
    // El conteo también excluye los ocultos: si no, una categoría anunciaría
    // "3 productos" y al entrar el cliente vería solo 2.
    include: { _count: { select: { products: { where: SOLO_VISIBLES } } } },
  });
  return categories;
}
