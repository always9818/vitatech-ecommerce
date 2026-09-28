import Link from "next/link";
import { Suspense } from "react";
import { VitoMascot } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { NotFoundSearch } from "@/components/NotFoundSearch";
import { WhatsAppAyuda } from "@/components/WhatsAppButton";
import { getCategoriesWithStock, getDepartmentCounts, getFeaturedProducts } from "@/lib/catalog";
import { DEPARTMENTS, DEPARTMENT_ORDER } from "@/lib/departments";
import { resolveCategoryIcon } from "@/lib/product-icon";
import { MENSAJE_NO_ENCONTRADO, whatsappUrl } from "@/lib/whatsapp";

export const metadata = { title: "Página no encontrada" };

/**
 * Lo que la 404 ofrece para seguir comprando. Si la base está dormida o falla,
 * se devuelve vacío en vez de lanzar: un error aquí convertiría el "no
 * encontrado" en un 500, que es justo lo que esta página existe para evitar.
 * Sin datos se sigue viendo Vito, el buscador y WhatsApp.
 */
async function sugerencias() {
  try {
    const [categorias, conteos, destacados] = await Promise.all([
      getCategoriesWithStock(),
      getDepartmentCounts(),
      getFeaturedProducts(4),
    ]);
    return { categorias: categorias.slice(0, 8), conteos, destacados };
  } catch (error) {
    console.error("[404] no se pudieron cargar las sugerencias", error);
    return { categorias: [], conteos: null, destacados: [] };
  }
}

const GRADIENTE_DIGITO =
  "bg-gradient-to-b from-vt-accent-hover via-vt-accent to-[#16B5A0] bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(163,230,53,.18)]";

/*
 * La página es síncrona a propósito y lo que consulta la base va aparte, en
 * <Sugerencias> dentro de un <Suspense>. Con la página entera async, al
 * hidratar Next reemplazaba el título "Página no encontrada" por el de la
 * portada (verificado en producción el 2026-09-28). Además así Vito y el
 * buscador se ven al instante aunque la base esté despertando.
 */
export default function NotFound() {
  return (
    <div className="animate-vt-fade relative overflow-hidden">
      {/* Fondo: retícula de circuito + halo lima detrás de Vito. */}
      <div aria-hidden className="vt-grid-bg pointer-events-none absolute inset-x-0 top-0 h-[620px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-1/2 h-[420px] w-[620px] max-w-full -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(163,230,53,.16), transparent)" }}
      />

      <div className="relative mx-auto max-w-[1180px] px-4 pt-12 pb-16 min-[520px]:px-6 min-[720px]:pt-16">
        {/* ── Encabezado: 4 · Vito · 4 ─────────────────────────────── */}
        <section className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-vt-accent/30 bg-vt-accent/[.1] px-3.5 py-1.5 text-[11.5px] font-bold tracking-[.12em] text-vt-accent uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-vt-accent shadow-[0_0_8px_var(--vt-accent)]" />
            Error 404
          </span>

          <div
            aria-hidden
            className="font-heading mt-6 flex items-center gap-[0.06em] text-[clamp(104px,24vw,200px)] leading-none font-bold tracking-[-.04em] select-none"
          >
            <span className={GRADIENTE_DIGITO}>4</span>

            {/* Vito ocupa el lugar del cero, con un radar que "busca". */}
            <span className="relative mx-[0.04em] grid h-[0.82em] w-[0.82em] place-items-center">
              <span className="animate-vt-radar absolute inset-0 rounded-full border-2 border-vt-accent/50" />
              <span
                className="animate-vt-radar absolute inset-0 rounded-full border-2 border-vt-accent/40"
                style={{ animationDelay: "1.5s" }}
              />
              <span className="absolute inset-0 rounded-full border-[3px] border-vt-accent/70 shadow-[0_0_40px_rgba(163,230,53,.22),inset_0_0_30px_rgba(163,230,53,.12)]" />
              <span className="animate-vt-float relative h-full w-full">
                <VitoMascot className="h-full w-full" />
              </span>
              <span className="animate-vt-float-shadow absolute -bottom-[0.14em] h-[0.05em] w-[0.5em] rounded-[50%] bg-black/70 blur-[3px]" />
            </span>

            <span className={GRADIENTE_DIGITO}>4</span>
          </div>

          <h1 className="font-heading mt-8 max-w-[640px] text-[26px] leading-[1.15] font-bold text-white min-[720px]:text-[34px]">
            Vito buscó por todos lados… <span className="text-vt-accent">y esta página no está.</span>
          </h1>
          <p className="mt-3 max-w-[520px] text-[14.5px] leading-relaxed text-vt-muted-1">
            Puede que el enlace esté mal escrito o que el producto ya no esté disponible. Búscalo aquí
            o sigue por uno de estos caminos.
          </p>

          <div className="mt-7 w-full">
            <NotFoundSearch />
          </div>

          <nav aria-label="Atajos" className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-semibold">
            <Link href="/" className="inline-flex items-center gap-1.5 text-vt-muted-1 transition-colors hover:text-vt-accent">
              <Icon name="store" className="h-4 w-4" />
              Ir al inicio
            </Link>
            <Link href="/catalogo" className="inline-flex items-center gap-1.5 text-vt-muted-1 transition-colors hover:text-vt-accent">
              <Icon name="package" className="h-4 w-4" />
              Ver todo el catálogo
            </Link>
            <Link href="/carrito" className="inline-flex items-center gap-1.5 text-vt-muted-1 transition-colors hover:text-vt-accent">
              <Icon name="cart" className="h-4 w-4" />
              Mi carrito
            </Link>
          </nav>
        </section>

        <Suspense fallback={null}>
          <Sugerencias />
        </Suspense>

        {/* ── Ayuda por WhatsApp ───────────────────────────────────── */}
        <section className="mt-14 flex flex-col items-center gap-5 rounded-3xl border border-vt-accent/20 bg-gradient-to-br from-vt-accent/[.09] via-white/[.02] to-transparent p-7 text-center min-[720px]:flex-row min-[720px]:p-8 min-[720px]:text-left">
          <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-vt-accent/[.14] text-vt-accent">
            <Icon name="chat" className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h2 className="font-heading text-[20px] font-bold text-white">¿Buscabas algo en particular?</h2>
            <p className="mt-1 text-[13.5px] text-vt-muted-1">
              Escríbenos y te decimos si lo tenemos o si lo podemos importar para ti.
            </p>
          </div>
          <div className="flex flex-none flex-col items-center gap-2">
            <WhatsAppAyuda href={whatsappUrl(MENSAJE_NO_ENCONTRADO)} />
            <Link href="/contacto" className="text-[12.5px] font-semibold text-vt-muted-1 hover:text-vt-accent">
              o escríbenos por correo
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

async function Sugerencias() {
  const { categorias, conteos, destacados } = await sugerencias();
  const departamentos = conteos ? DEPARTMENT_ORDER.filter((d) => conteos[d] > 0) : [];

  return (
    <>
          {/* ── Departamentos ────────────────────────────────────────── */}
          {departamentos.length > 0 && (
            <section className="mt-16">
              <TituloSeccion>Explora por departamento</TituloSeccion>
              <div className={`grid gap-4 ${departamentos.length > 1 ? "min-[720px]:grid-cols-2" : ""}`}>
                {departamentos.map((d, i) => {
                  const info = DEPARTMENTS[d];
                  const total = conteos![d];
                  return (
                    <Link
                      key={d}
                      href={`/catalogo?dept=${info.slug}`}
                      className="animate-vt-stagger group relative flex items-center gap-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] p-6 transition-colors hover:border-vt-accent/50 hover:bg-white/[.05]"
                      style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: "radial-gradient(circle, rgba(163,230,53,.18), transparent 65%)" }}
                      />
                      <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl border border-vt-accent/25 bg-vt-accent/[.1] text-vt-accent transition-transform duration-300 group-hover:scale-105">
                        <Icon name={info.icon} className="h-7 w-7" />
                      </span>
                      <div className="relative min-w-0 flex-1">
                        <div className="font-heading text-[19px] font-bold text-white">{info.label}</div>
                        <div className="mt-0.5 text-[13px] text-vt-muted-1">{info.tagline}</div>
                        <div className="mt-2 text-[12px] font-semibold text-vt-muted-2">
                          {total} {total === 1 ? "producto" : "productos"}
                        </div>
                      </div>
                      <Icon
                        name="chevronRight"
                        className="relative h-5 w-5 flex-none text-vt-muted-2 transition-all duration-300 group-hover:translate-x-1 group-hover:text-vt-accent"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Categorías populares ─────────────────────────────────── */}
          {categorias.length > 0 && (
            <section className="mt-10">
              <TituloSeccion>Categorías populares</TituloSeccion>
              <div className="flex flex-wrap gap-2.5">
                {categorias.map((c) => (
                  <Link
                    key={c.id}
                    href={`/catalogo?dept=${DEPARTMENTS[c.department].slug}&cat=${encodeURIComponent(c.name)}`}
                    className="vt-btn inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] py-2 pr-2.5 pl-3 text-[13px] font-semibold text-vt-fg hover:border-vt-accent/50 hover:text-vt-accent"
                  >
                    <Icon name={resolveCategoryIcon(c.name)} className="h-4 w-4 text-vt-accent" />
                    {c.name}
                    <span className="rounded-full bg-white/[.07] px-1.5 py-px text-[11px] text-vt-muted-2">
                      {c._count.products}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Destacados ───────────────────────────────────────────── */}
          {destacados.length > 0 && (
            <section className="mt-14">
              <div className="mb-5 flex items-end justify-between gap-4">
                <TituloSeccion className="mb-0">Quizá te interese</TituloSeccion>
                <Link
                  href="/catalogo"
                  className="inline-flex flex-none items-center gap-1 text-[13px] font-semibold text-vt-accent hover:underline"
                >
                  Ver todo <Icon name="chevronRight" className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 min-[880px]:grid-cols-4">
                {/* index desde 4: están debajo del pliegue, sus fotos pueden
                    esperar (ProductCard carga "eager" solo las 4 primeras). */}
                {destacados.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i + 4} />
                ))}
              </div>
            </section>
          )}
    </>
  );
}

function TituloSeccion({ children, className = "mb-5" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-heading flex items-center gap-3 text-[18px] font-bold text-white ${className}`}>
      <span className="h-5 w-1 rounded-full bg-vt-accent" />
      {children}
    </h2>
  );
}
