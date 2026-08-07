import type { Metadata } from "next";
import Link from "next/link";
import {
  getFilteredProducts,
  getCategoryCounts,
  getBrands,
  CATALOG_PAGE_SIZE,
  type SortOption,
} from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";
import { BrandFilterList } from "@/components/BrandFilterList";
import { Pagination } from "@/components/Pagination";
import { VitoMascot } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { pageMetadata } from "@/lib/site";
import { DEPARTMENTS, DEPARTMENT_ORDER, departmentFromSlug } from "@/lib/departments";

type CatalogSearchParams = {
  dept?: string;
  cat?: string;
  brand?: string;
  search?: string;
  sort?: string;
  page?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const { cat, dept } = await searchParams;
  const category = cat && cat !== "Todas" ? cat : null;
  const department = departmentFromSlug(dept);
  const info = department ? DEPARTMENTS[department] : null;

  if (category) {
    return pageMetadata({
      title: category,
      description: `Compra ${category.toLowerCase()} originales en Guatemala, con envío a todo el país y garantía real.`,
      // Solo categoría y departamento definen páginas distintas; marca,
      // búsqueda y orden son filtros del mismo listado, no contenido nuevo
      // para indexar por separado.
      path: `/catalogo?cat=${encodeURIComponent(category)}`,
    });
  }

  if (info) {
    return pageMetadata({
      title: info.label,
      description: `${info.tagline}. Envío a todo Guatemala.`,
      path: `/catalogo?dept=${info.slug}`,
    });
  }

  return pageMetadata({
    title: "Catálogo",
    description:
      "Tecnología, suplementos y vitaminas originales, con envío a todo Guatemala y garantía real.",
    path: "/catalogo",
  });
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;
  const category = params.cat ?? "Todas";
  const brands = params.brand ? params.brand.split(",").filter(Boolean) : [];
  const search = params.search ?? "";
  const sort = (params.sort as SortOption) ?? "relevancia";
  // Un `?dept=` que no calce con ningún departamento se ignora (queda null) en
  // vez de dejar el catálogo vacío por una URL mal escrita.
  const department = departmentFromSlug(params.dept);
  const departmentInfo = department ? DEPARTMENTS[department] : null;

  const [allProducts, categoryCounts, brandList, productosDelAmbito] = await Promise.all([
    getFilteredProducts({ department, category, brands, search, sort }),
    getCategoryCounts(),
    getBrands(),
    // Sin filtros más que el departamento: sirve para saber qué marcas tiene
    // ese departamento y no ofrecer un filtro que lleve a cero resultados.
    getFilteredProducts({ department }),
  ]);

  // Dentro de "Salud y Bienestar" no tiene sentido ofrecer Asus o HP: filtrar
  // por ahí daría cero resultados siempre. La lista de marcas se recorta a las
  // que de verdad tienen algo en el departamento que se está viendo.
  const marcasDelAmbito = new Set(productosDelAmbito.map((p) => p.brand.name));
  const brandsVisibles = departmentInfo
    ? brandList.filter((b) => marcasDelAmbito.has(b.name))
    : brandList;

  const totalPages = Math.max(1, Math.ceil(allProducts.length / CATALOG_PAGE_SIZE));
  // Una página fuera de rango (link viejo compartido, o el filtro cambió y ya
  // no hay tantas páginas) cae a la última válida en vez de mostrar "Sin
  // resultados" sobre un catálogo que sí tiene productos.
  const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
  const products = allProducts.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE);

  // Dentro de un departamento, la barra lateral solo habla de ese departamento:
  // el total, las categorías y el enlace "Todas" se limitan a él, para que el
  // cliente que está viendo suplementos no vea contadores de laptops.
  const countsDelAmbito = departmentInfo
    ? categoryCounts.filter((c) => c.department === department)
    : categoryCounts;

  const totalCount = countsDelAmbito.reduce((a, c) => a + c._count.products, 0);
  const resultLabel = `${allProducts.length} ${allProducts.length === 1 ? "resultado" : "resultados"}`;
  // El total de arriba sí cuenta todo el ámbito; la lista de abajo solo muestra
  // categorías con al menos un producto, para no ofrecer un filtro que lleve
  // a "Sin resultados" (ej. Monitores o Impresoras cuando están sin stock).
  const categoriesWithStock = countsDelAmbito.filter((c) => c._count.products > 0);

  /** Conserva el departamento al cambiar de categoría dentro de la barra lateral. */
  const hrefCategoria = (nombre?: string) => {
    const qs = new URLSearchParams();
    if (departmentInfo) qs.set("dept", departmentInfo.slug);
    if (nombre) qs.set("cat", nombre);
    const s = qs.toString();
    return `/catalogo${s ? `?${s}` : ""}`;
  };

  const tituloAmbito = departmentInfo?.label ?? "Catálogo";

  return (
    <div className="animate-vt-fade mx-auto max-w-[1180px] px-6 py-10">
      <div className="text-[13px] text-vt-muted-2">
        <Link href="/">Inicio</Link>
        {departmentInfo && (
          <>
            {" › "}
            <Link href={`/catalogo?dept=${departmentInfo.slug}`}>{departmentInfo.label}</Link>
          </>
        )}
        {" › "}
        {category === "Todas" ? (departmentInfo ? "Todo" : "Catálogo") : category}
      </div>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-heading flex items-center gap-2.5 text-[30px] font-bold text-white">
            {departmentInfo && category === "Todas" && (
              <span className="text-vt-accent">
                <Icon name={departmentInfo.icon} className="h-7 w-7" />
              </span>
            )}
            {category === "Todas" ? tituloAmbito : category}{" "}
            <span className="text-[15px] font-semibold text-vt-muted-2">· {resultLabel}</span>
          </div>
          {departmentInfo && category === "Todas" && (
            <p className="mt-1 text-[13.5px] text-vt-muted-1">{departmentInfo.tagline}</p>
          )}
        </div>
        <SortSelect />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 min-[880px]:grid-cols-[230px_1fr]">
        <aside className="flex flex-col gap-8">
          {/* Cambiar de departamento sin tener que volver al menú de arriba. */}
          <div>
            <div className="mb-3 text-[12px] font-bold tracking-[.06em] text-vt-muted-2 uppercase">
              Departamento
            </div>
            <div className="flex flex-col gap-1">
              <Link
                href="/catalogo"
                className="rounded-lg px-2.5 py-2 text-[13px]"
                style={
                  !departmentInfo
                    ? { background: "rgba(163,230,53,.14)", color: "#a3e635", fontWeight: 700 }
                    : { color: "#a8a29e", fontWeight: 500 }
                }
              >
                Todo
              </Link>
              {DEPARTMENT_ORDER.map((d) => {
                const info = DEPARTMENTS[d];
                return (
                  <Link
                    key={d}
                    href={`/catalogo?dept=${info.slug}`}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px]"
                    style={
                      department === d
                        ? { background: "rgba(163,230,53,.14)", color: "#a3e635", fontWeight: 700 }
                        : { color: "#a8a29e", fontWeight: 500 }
                    }
                  >
                    <Icon name={info.icon} className="h-4 w-4" />
                    {info.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 text-[12px] font-bold tracking-[.06em] text-vt-muted-2 uppercase">
              Categorías
            </div>
            <div className="flex flex-col gap-1">
              <Link
                href={hrefCategoria()}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px]"
                style={
                  category === "Todas"
                    ? { background: "#a3e635", color: "#1a2e05", fontWeight: 700 }
                    : { color: "#a8a29e", fontWeight: 500 }
                }
              >
                <span>Todas las categorías</span>
                <span>{totalCount}</span>
              </Link>
              {categoriesWithStock.map((c) => (
                <Link
                  key={c.id}
                  href={hrefCategoria(c.name)}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px]"
                  style={
                    category === c.name
                      ? { background: "#a3e635", color: "#1a2e05", fontWeight: 700 }
                      : { color: "#a8a29e", fontWeight: 500 }
                  }
                >
                  <span>{c.name}</span>
                  <span>{c._count.products}</span>
                </Link>
              ))}
            </div>
          </div>

          {brandsVisibles.length > 0 && (
            <div>
              <div className="mb-3 text-[12px] font-bold tracking-[.06em] text-vt-muted-2 uppercase">
                Marca
              </div>
              <BrandFilterList brands={brandsVisibles} />
            </div>
          )}
        </aside>

        <div>
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[880px]:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                searchParams={{
                  dept: params.dept,
                  cat: params.cat,
                  brand: params.brand,
                  search: params.search,
                  sort: params.sort,
                }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 py-20 text-center">
              <VitoMascot className="h-24 w-24" />
              <div className="text-[16px] font-bold text-vt-fg">Sin resultados</div>
              <p className="max-w-[320px] text-[13.5px] text-vt-muted-1">
                Vito buscó por toda la bodega y no encontró nada con esos filtros.
              </p>
              {/* Limpia los filtros SIN sacar al cliente de su departamento:
                  si estaba viendo suplementos, sigue en suplementos. */}
              <Link
                href={hrefCategoria()}
                className="vt-btn mt-2 inline-block rounded-lg bg-vt-accent/[.15] px-5 py-2.5 text-[13px] font-bold text-vt-accent hover:bg-vt-accent/25"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
