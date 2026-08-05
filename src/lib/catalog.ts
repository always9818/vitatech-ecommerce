import { prisma } from "@/lib/prisma";

export type SortOption = "relevancia" | "menor" | "mayor" | "descuento";

/**
 * Los productos ocultos no existen para el cliente. Se aplica en TODO lo que
 * mira la tienda (destacados, catálogo, búsqueda, conteos y la ficha), no solo
 * en el listado: si no, un producto oculto seguiría siendo alcanzable por su
 * enlace directo o apareciendo en los contadores por categoría.
 */
const SOLO_VISIBLES = { visible: true } as const;

/**
 * Un producto agotado NO se oculta: conserva su ficha, su enlace y su lugar en
 * buscadores, porque volverá a haber existencias. Lo que no hace es competir
 * con lo que sí se puede comprar hoy, así que se va al final de cualquier orden
 * que elija el visitante. Ocultarlo de verdad sigue siendo decisión manual
 * (botón Ocultar del panel).
 */
function agotadosAlFinal<T extends { stock: number }>(
  productos: T[],
  desempate: (a: T, b: T) => number = () => 0,
): T[] {
  const sinExistencias = (p: T) => (p.stock > 0 ? 0 : 1);
  // `sort` es estable en JS, así que cuando el desempate devuelve 0 se conserva
  // el orden con el que vinieron de la base.
  return [...productos].sort((a, b) => sinExistencias(a) - sinExistencias(b) || desempate(a, b));
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

export async function getFeaturedProducts(take = 4) {
  const disponibles = await prisma.product.findMany({
    take,
    where: { ...SOLO_VISIBLES, stock: { gt: 0 } },
    orderBy: { createdAt: "asc" },
    include: { category: true, brand: true },
  });
  if (disponibles.length >= take) return disponibles;

  // Solo cuando no alcanzan los que sí se pueden comprar se completa con
  // agotados: la portada nunca debe quedar con huecos.
  const agotados = await prisma.product.findMany({
    take: take - disponibles.length,
    where: { ...SOLO_VISIBLES, stock: { lte: 0 } },
    orderBy: { createdAt: "asc" },
    include: { category: true, brand: true },
  });
  return [...disponibles, ...agotados];
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

  type Item = (typeof withOff)[number];
  const desempate: (a: Item, b: Item) => number =
    sort === "menor"
      ? (a, b) => a.price - b.price
      : sort === "mayor"
        ? (a, b) => b.price - a.price
        : sort === "descuento"
          ? (a, b) => b.off - a.off
          : () => 0;

  return agotadosAlFinal(withOff, desempate);
}

/** Solo lo que necesita el sitemap: id y fecha de actualización. */
export async function getSitemapProducts() {
  return prisma.product.findMany({
    where: SOLO_VISIBLES,
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCategoryCounts() {
  const categories = await prisma.category.findMany({
    // El conteo también excluye los ocultos: si no, una categoría anunciaría
    // "3 productos" y al entrar el cliente vería solo 2.
    include: { _count: { select: { products: { where: SOLO_VISIBLES } } } },
  });
  return categories;
}

/**
 * Solo categorías con al menos un producto. Se usa en la navegación
 * (encabezado, chips de la portada, filtro del catálogo) para no mandar al
 * cliente a una categoría vacía — a diferencia de `getCategories()`, que sí
 * debe listarlas todas en el panel de administración (ahí hace falta ver una
 * categoría sin productos para poder agregarle el primero).
 */
export async function getCategoriesWithStock() {
  const categories = await getCategoryCounts();
  return categories
    .filter((c) => c._count.products > 0)
    .sort((a, b) => b._count.products - a._count.products || a.name.localeCompare(b.name));
}
