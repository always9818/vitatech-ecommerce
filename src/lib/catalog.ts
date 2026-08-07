import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_SEGUNDOS, TAG_CATALOGO } from "@/lib/cache-tags";
import { DEPARTMENTS, DEPARTMENT_ORDER, type Department } from "@/lib/departments";

export type SortOption = "relevancia" | "menor" | "mayor" | "descuento";

/**
 * Cuántos productos muestra cada página del catálogo. `getFilteredProducts`
 * trae y ordena TODO el catálogo visible en memoria (viene de una sola lista
 * ya cacheada) — con las decenas de productos de hoy no pesa nada, pero sin
 * paginar, un catálogo de cientos de productos mandaría una página gigante al
 * navegador. Paginar aquí no reduce ese trabajo en memoria, solo cuánto se
 * manda y se pinta; si el catálogo crece mucho más, ahí sí convendría filtrar
 * y paginar directamente en SQL.
 */
export const CATALOG_PAGE_SIZE = 24;

/**
 * Los productos ocultos no existen para el cliente. Se aplica en TODO lo que
 * mira la tienda (destacados, catálogo, búsqueda, conteos y la ficha), no solo
 * en el listado: si no, un producto oculto seguiría siendo alcanzable por su
 * enlace directo o apareciendo en los contadores por categoría.
 */
const SOLO_VISIBLES = { visible: true } as const;

/**
 * Campos que la tienda de verdad pinta en una tarjeta de producto.
 *
 * Se listan a mano en vez de usar `include` por dos razones: la caché guarda
 * cada resultado como JSON, así que traer columnas de más significa pagarlas en
 * cada lectura; y sobre todo, un `DateTime` de Prisma vuelve de la caché
 * convertido en texto aunque TypeScript siga diciendo `Date`. Al no seleccionar
 * fechas, esa trampa no puede aparecer.
 */
const CAMPOS_TARJETA = {
  id: true,
  name: true,
  price: true,
  oldPrice: true,
  stock: true,
  icon: true,
  images: true,
  category: { select: { id: true, name: true, department: true } },
  brand: { select: { id: true, name: true } },
} as const;

/** Lo anterior más lo que solo hace falta en la ficha completa. */
const CAMPOS_FICHA = {
  ...CAMPOS_TARJETA,
  sku: true,
  description: true,
  specs: true,
} as const;

type ProductoTarjeta = {
  id: string;
  name: string;
  price: number;
  oldPrice: number;
  stock: number;
  icon: string;
  images: string[];
  category: { id: string; name: string; department: Department };
  brand: { id: string; name: string };
};

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

/**
 * TODO el catálogo visible, en una sola entrada de caché.
 *
 * Antes cada combinación de filtros era su propia consulta a la base. Como la
 * búsqueda es texto libre, cachear "por filtro" habría creado una entrada nueva
 * por cada palabra que alguien escribiera, y casi ninguna se volvería a usar.
 * Guardando la lista completa una vez, cualquier filtro se resuelve en memoria
 * y sin tocar la base — que era el objetivo.
 *
 * El techo de este enfoque es la memoria: con cientos de productos va sobrado,
 * con decenas de miles habría que volver a filtrar en SQL y paginar.
 */
const leerCatalogoVisible = unstable_cache(
  async (): Promise<ProductoTarjeta[]> =>
    prisma.product.findMany({
      where: SOLO_VISIBLES,
      orderBy: { createdAt: "asc" },
      select: CAMPOS_TARJETA,
    }),
  ["catalogo-visible"],
  { tags: [TAG_CATALOGO], revalidate: CACHE_SEGUNDOS },
);

export async function getCategories() {
  // Sin caché a propósito: solo la usa el panel de administración, donde hace
  // falta ver también las categorías vacías y siempre el dato recién guardado.
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

/**
 * Categorías listas para el `<select>` del formulario de productos, ordenadas
 * por departamento y con su etiqueta para agruparlas en `<optgroup>`.
 *
 * La categoría es lo que decide en qué mitad de la tienda aparece un producto,
 * así que conviene que eso se vea al elegirla y no se descubra después.
 */
export async function getCategoryOptions() {
  const categories = await getCategories();
  return categories
    .sort(
      (a, b) =>
        DEPARTMENT_ORDER.indexOf(a.department) - DEPARTMENT_ORDER.indexOf(b.department) ||
        a.name.localeCompare(b.name)
    )
    .map((c) => ({ id: c.id, name: c.name, departmentLabel: DEPARTMENTS[c.department].label }));
}

export const getBrands = unstable_cache(
  async () => prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ["marcas"],
  { tags: [TAG_CATALOGO], revalidate: CACHE_SEGUNDOS },
);

/**
 * Destacados, opcionalmente de un solo departamento (la portada muestra una
 * fila por cada uno). Prioriza lo que sí se puede comprar hoy y solo completa
 * con agotados si no alcanzan, para que la portada nunca quede con huecos.
 */
export async function getFeaturedProducts(take = 4, department?: Department) {
  const todos = await leerCatalogoVisible();
  const delDepartamento = department
    ? todos.filter((p) => p.category.department === department)
    : todos;

  const disponibles = delDepartamento.filter((p) => p.stock > 0).slice(0, take);
  if (disponibles.length >= take) return disponibles;

  const agotados = delDepartamento
    .filter((p) => p.stock <= 0)
    .slice(0, take - disponibles.length);
  return [...disponibles, ...agotados];
}

export async function getProductById(id: string) {
  // `findFirst` y no `findUnique` para poder exigir además que esté visible:
  // así un producto oculto tampoco es alcanzable por su enlace directo, que
  // es justo el que queda guardado en historiales y buscadores.
  //
  // La caché se arma dentro de la función para que el `id` forme parte de su
  // clave. Va con la misma etiqueta que el resto del catálogo: cualquier cambio
  // del panel las descarta todas de una vez. Es de sobra para el tamaño de esta
  // tienda y evita tener que acordarse de invalidar dos etiquetas distintas.
  return unstable_cache(
    async () =>
      prisma.product.findFirst({
        where: { id, ...SOLO_VISIBLES },
        select: CAMPOS_FICHA,
      }),
    ["producto", id],
    { tags: [TAG_CATALOGO], revalidate: CACHE_SEGUNDOS },
  )();
}

/**
 * "También te puede interesar": productos de la misma categoría, sin
 * repetir el que se está viendo. Se arma sobre la misma lista completa que ya
 * cachea `leerCatalogoVisible` — no es una consulta nueva a la base — así que
 * usa el mismo criterio que el resto del catálogo: los agotados se muestran
 * solo si no alcanzan productos disponibles para completar `take`.
 */
export async function getRelatedProducts(opts: { productId: string; categoryId: string; take?: number }) {
  const { productId, categoryId, take = 4 } = opts;
  const todos = await leerCatalogoVisible();
  const mismaCategoria = todos.filter((p) => p.id !== productId && p.category.id === categoryId);

  const disponibles = mismaCategoria.filter((p) => p.stock > 0).slice(0, take);
  if (disponibles.length >= take) return disponibles;

  const agotados = mismaCategoria.filter((p) => p.stock <= 0).slice(0, take - disponibles.length);
  return [...disponibles, ...agotados];
}

/** Mismo criterio que usaba Postgres con `mode: "insensitive"`. */
function contiene(texto: string, busqueda: string) {
  return texto.toLowerCase().includes(busqueda);
}

export async function getFilteredProducts(opts: {
  department?: Department | null;
  category?: string;
  brands?: string[];
  search?: string;
  sort?: SortOption;
}) {
  const { department, category, brands, search, sort = "relevancia" } = opts;

  const todos = await leerCatalogoVisible();
  const busqueda = search?.trim().toLowerCase();

  const products = todos.filter((p) => {
    // El departamento manda sobre todo lo demás: dentro de Salud y Bienestar
    // no debe colarse una laptop ni aunque la búsqueda calce con su marca.
    if (department && p.category.department !== department) return false;
    if (category && category !== "Todas" && p.category.name !== category) return false;
    if (brands && brands.length && !brands.includes(p.brand.name)) return false;
    if (busqueda) {
      const coincide =
        contiene(p.name, busqueda) ||
        contiene(p.category.name, busqueda) ||
        contiene(p.brand.name, busqueda);
      if (!coincide) return false;
    }
    return true;
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

/**
 * Solo lo que necesita el sitemap: id y fecha de actualización.
 *
 * Queda fuera de la caché justamente por esa fecha: al guardarse como JSON, un
 * `Date` volvería convertido en texto. Además la consulta la hace un buscador
 * de vez en cuando, no un cliente esperando la página.
 */
export async function getSitemapProducts() {
  return prisma.product.findMany({
    where: SOLO_VISIBLES,
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export const getCategoryCounts = unstable_cache(
  async () =>
    prisma.category.findMany({
      // El conteo también excluye los ocultos: si no, una categoría anunciaría
      // "3 productos" y al entrar el cliente vería solo 2.
      select: {
        id: true,
        name: true,
        department: true,
        _count: { select: { products: { where: SOLO_VISIBLES } } },
      },
    }),
  ["conteo-categorias"],
  { tags: [TAG_CATALOGO], revalidate: CACHE_SEGUNDOS },
);

/**
 * Solo categorías con al menos un producto. Se usa en la navegación
 * (encabezado, chips de la portada, filtro del catálogo) para no mandar al
 * cliente a una categoría vacía — a diferencia de `getCategories()`, que sí
 * debe listarlas todas en el panel de administración (ahí hace falta ver una
 * categoría sin productos para poder agregarle el primero).
 */
export async function getCategoriesWithStock(department?: Department) {
  const categories = await getCategoryCounts();
  return categories
    .filter((c) => c._count.products > 0)
    .filter((c) => !department || c.department === department)
    .sort((a, b) => b._count.products - a._count.products || a.name.localeCompare(b.name));
}

/**
 * Cuántos productos visibles tiene cada departamento. El menú lo usa para NO
 * anunciar un departamento vacío: mientras Angel no suba ningún suplemento,
 * "Salud y Bienestar" no aparece y el cliente no se topa con una sección
 * hueca — el mismo criterio que ya se usaba con las categorías sin stock.
 */
export async function getDepartmentCounts(): Promise<Record<Department, number>> {
  const categories = await getCategoryCounts();
  const counts = { TECNOLOGIA: 0, SALUD: 0 } as Record<Department, number>;
  for (const c of categories) {
    counts[c.department] += c._count.products;
  }
  return counts;
}
