import Link from "next/link";
import { getFilteredProducts, getCategoryCounts, getBrands, type SortOption } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";
import { BrandFilterList } from "@/components/BrandFilterList";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; brand?: string; search?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const category = params.cat ?? "Todas";
  const brands = params.brand ? params.brand.split(",").filter(Boolean) : [];
  const search = params.search ?? "";
  const sort = (params.sort as SortOption) ?? "relevancia";

  const [products, categoryCounts, brandList] = await Promise.all([
    getFilteredProducts({ category, brands, search, sort }),
    getCategoryCounts(),
    getBrands(),
  ]);

  const totalCount = categoryCounts.reduce((a, c) => a + c._count.products, 0);
  const resultLabel = `${products.length} ${products.length === 1 ? "resultado" : "resultados"}`;

  return (
    <div className="animate-vt-fade mx-auto max-w-[1180px] px-6 py-10">
      <div className="text-[13px] text-vt-muted-2">
        <Link href="/">Inicio</Link> › {category === "Todas" ? "Catálogo" : category}
      </div>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="font-heading text-[30px] font-bold text-white">
          {category === "Todas" ? "Catálogo" : category}{" "}
          <span className="text-[15px] font-semibold text-vt-muted-2">· {resultLabel}</span>
        </div>
        <SortSelect />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 min-[880px]:grid-cols-[230px_1fr]">
        <aside className="flex flex-col gap-8">
          <div>
            <div className="mb-3 text-[12px] font-bold tracking-[.06em] text-vt-muted-2 uppercase">
              Categorías
            </div>
            <div className="flex flex-col gap-1">
              <Link
                href="/catalogo"
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
              {categoryCounts.map((c) => (
                <Link
                  key={c.id}
                  href={`/catalogo?cat=${encodeURIComponent(c.name)}`}
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

          <div>
            <div className="mb-3 text-[12px] font-bold tracking-[.06em] text-vt-muted-2 uppercase">
              Marca
            </div>
            <BrandFilterList brands={brandList} />
          </div>
        </aside>

        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[880px]:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 py-20 text-center">
              <span className="text-4xl">🔍</span>
              <div className="text-[16px] font-bold text-vt-fg">Sin resultados</div>
              <Link
                href="/catalogo"
                className="mt-2 inline-block rounded-lg bg-vt-accent/[.15] px-5 py-2.5 text-[13px] font-bold text-vt-accent"
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
