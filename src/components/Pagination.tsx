import Link from "next/link";
import { Icon } from "@/components/Icon";

/**
 * Server component a propósito: cambiar de página es solo navegación, no
 * necesita estado de cliente. Cada número es un `<Link>` normal, así que
 * también funciona con JavaScript deshabilitado y Google puede seguir los
 * enlaces para indexar las páginas siguientes.
 */
export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  /** Los filtros activos (cat, brand, search, sort), para no perderlos al cambiar de página. */
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/catalogo${qs ? `?${qs}` : ""}`;
  };

  // Con pocas páginas se listan todas; con muchas, solo un tramo alrededor de
  // la actual más las puntas, para no imprimir 40 números seguidos.
  const paginas = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const numeros = [...paginas].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return (
    <nav aria-label="Paginación del catálogo" className="mt-10 flex items-center justify-center gap-1.5">
      <Link
        href={hrefFor(page - 1)}
        aria-label="Página anterior"
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={
          page <= 1
            ? "pointer-events-none grid h-9 w-9 place-items-center rounded-lg text-vt-muted-3"
            : "grid h-9 w-9 place-items-center rounded-lg text-vt-fg hover:bg-white/[.06]"
        }
      >
        <Icon name="chevronLeft" className="h-[18px] w-[18px]" />
      </Link>

      {numeros.map((p, i) => {
        const anterior = numeros[i - 1];
        const salto = anterior !== undefined && p - anterior > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {salto && <span className="px-1 text-[13px] text-vt-muted-3">…</span>}
            <Link
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "grid h-9 w-9 place-items-center rounded-lg bg-vt-accent text-[13px] font-bold text-vt-accent-fg"
                  : "grid h-9 w-9 place-items-center rounded-lg text-[13px] font-semibold text-vt-fg hover:bg-white/[.06]"
              }
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        href={hrefFor(page + 1)}
        aria-label="Página siguiente"
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={
          page >= totalPages
            ? "pointer-events-none grid h-9 w-9 place-items-center rounded-lg text-vt-muted-3"
            : "grid h-9 w-9 place-items-center rounded-lg text-vt-fg hover:bg-white/[.06]"
        }
      >
        <Icon name="chevronRight" className="h-[18px] w-[18px]" />
      </Link>
    </nav>
  );
}
