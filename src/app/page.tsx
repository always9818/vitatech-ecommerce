import Link from "next/link";
import { getCategoriesWithStock, getFeaturedProducts, getDepartmentCounts } from "@/lib/catalog";
import { DEPARTMENTS, DEPARTMENT_ORDER } from "@/lib/departments";
import { ProductCard } from "@/components/ProductCard";
import { Icon, type IconName } from "@/components/Icon";
import { resolveCategoryIcon } from "@/lib/product-icon";
import { getSiteSettings, resolveHeroContent } from "@/lib/site-settings";
import { getHeroSlides } from "@/lib/hero-slides";
import { HeroCarousel } from "@/components/HeroCarousel";
import { VitoMascot } from "@/components/Logo";

const BENEFITS: { icon: IconName; title: string; sub: string }[] = [
  { icon: "truck", title: "Envío a todo el país", sub: "Gratis desde Q 299" },
  { icon: "chat", title: "Soporte por WhatsApp", sub: "Lun a sáb, 9am–6pm" },
  { icon: "shield", title: "Garantía real", sub: "Por desperfectos de fábrica" },
  // Solo lo que Recurrente procesa de verdad. Decía "Tarjeta o contra entrega"
  // y contra entrega nunca existió en el checkout: prometerlo era invitar a un
  // reclamo.
  { icon: "card", title: "Pago seguro", sub: "Tarjeta, hasta 12 cuotas" },
];

export default async function HomePage() {
  const [categories, settings, slides, departmentCounts] = await Promise.all([
    getCategoriesWithStock(),
    getSiteSettings(),
    getHeroSlides(),
    getDepartmentCounts(),
  ]);

  // Una fila de destacados por departamento. Se piden en paralelo y se
  // descartan los que no tienen nada que mostrar: mientras Angel no suba
  // ningún suplemento, "Salud y Bienestar" no aparece en la portada en vez de
  // dejar una sección vacía.
  const destacadosPorDepartamento = (
    await Promise.all(
      DEPARTMENT_ORDER.map(async (department) => ({
        department,
        productos: departmentCounts[department] > 0 ? await getFeaturedProducts(4, department) : [],
      }))
    )
  ).filter((d) => d.productos.length > 0);

  const categoriasPorDepartamento = DEPARTMENT_ORDER.map((department) => ({
    department,
    items: categories.filter((c) => c.department === department),
  })).filter((d) => d.items.length > 0);

  const heroImage = settings?.heroImageUrl;
  const hero = resolveHeroContent(settings);

  return (
    <div className="animate-vt-fade mx-auto max-w-[1180px] px-6 py-10">
      {/* Mosaico de portada: el carrusel y el bloque de temporada viven en la
          misma retícula, como piezas de un solo conjunto, en vez de ser dos
          secciones sueltas una debajo de la otra. */}
      <div className="grid grid-cols-1 gap-5 min-[980px]:grid-cols-[1.9fr_1fr]">
        {slides.length > 0 ? (
          <HeroCarousel slides={slides} />
        ) : (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.04]">
            <div className="relative aspect-[4/3] w-full min-[560px]:aspect-[16/9]">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-contain" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-vt-muted-3">
                  <Icon name="image" className="h-16 w-16" />
                </div>
              )}
            </div>
          </section>
        )}

        <section className="relative flex flex-col justify-center overflow-hidden rounded-3xl border border-white/10 p-7 min-[980px]:p-8">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-[380px] w-[380px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(163,230,53,.2), transparent 65%)" }}
          />
          <div className="relative">
            {hero.badge && (
              <span className="inline-flex items-center gap-2 rounded-full border border-vt-accent/30 bg-vt-accent/[.12] px-3.5 py-1.5 text-[12px] font-bold tracking-[.05em] text-vt-accent">
                {hero.badge}
              </span>
            )}
            <h1 className="font-heading my-4 text-[30px] leading-[1.1] font-bold text-white min-[980px]:text-[34px]">
              {hero.title} {hero.titleAccent && <span className="text-vt-accent">{hero.titleAccent}</span>}
            </h1>
            {hero.subtitle && <p className="text-[14.5px] text-vt-muted-1">{hero.subtitle}</p>}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/catalogo"
                className="vt-btn vt-btn-accent rounded-[10px] bg-vt-accent px-6 py-3.5 text-center text-sm font-bold text-vt-accent-fg"
              >
                Ver ofertas
              </Link>
              <Link
                href="/catalogo"
                className="vt-btn rounded-[10px] border border-white/25 px-6 py-3.5 text-center text-sm font-bold text-white hover:border-vt-accent hover:text-vt-accent"
              >
                Explorar catálogo
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Benefits */}
      <section className="mt-14 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[880px]:grid-cols-4">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"
          >
            <span className="text-vt-accent">
              <Icon name={b.icon} className="h-6 w-6" />
            </span>
            <div>
              <div className="text-[13.5px] font-bold text-white">{b.title}</div>
              <div className="text-[11.5px] text-vt-muted-2">{b.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Presentación de la marca, con Vito */}
      <section className="mt-10 flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] p-8 text-center min-[720px]:flex-row min-[720px]:gap-8 min-[720px]:p-10 min-[720px]:text-left">
        <VitoMascot className="h-28 w-28 flex-none min-[720px]:h-32 min-[720px]:w-32" />
        <div>
          <h2 className="font-heading text-[22px] font-bold text-white min-[720px]:text-[26px]">
            Hola, soy <span className="text-vt-accent">Vito</span>
          </h2>
          {/* El nombre VITATECH siempre fue literal: VITA por vitaminas y
              suplementos, TECH por tecnología. Este párrafo decía solo lo
              segundo. */}
          <p className="mt-2 max-w-[560px] text-[14.5px] leading-relaxed text-vt-muted-1">
            Te acompaño en Importadora Vitatech. Nuestro nombre lo dice todo:{" "}
            <span className="font-semibold text-vt-fg">VITA</span> por los suplementos y vitaminas
            que cuidan tu salud, y <span className="font-semibold text-vt-fg">TECH</span> por la
            tecnología original de las mejores marcas. Todo con envío a todo Guatemala.
          </p>
        </div>
      </section>

      {/* Los dos departamentos, como puerta de entrada grande. Es lo primero
          que le dice al visitante que aquí hay dos mundos y no solo uno. */}
      {destacadosPorDepartamento.length > 1 && (
        <section className="mt-10 grid grid-cols-1 gap-4 min-[640px]:grid-cols-2">
          {DEPARTMENT_ORDER.filter((d) => departmentCounts[d] > 0).map((d) => {
            const info = DEPARTMENTS[d];
            return (
              <Link
                key={d}
                href={`/catalogo?dept=${info.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-5 transition-colors hover:border-vt-accent/50"
              >
                <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-vt-accent/[.12] text-vt-accent">
                  <Icon name={info.icon} className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="font-heading block text-[17px] font-bold text-white">
                    {info.label}
                  </span>
                  <span className="block text-[12.5px] text-vt-muted-2">{info.tagline}</span>
                </span>
                <span className="ml-auto flex-none text-vt-muted-3 group-hover:text-vt-accent">
                  <Icon name="chevronRight" className="h-5 w-5" />
                </span>
              </Link>
            );
          })}
        </section>
      )}

      {/* Category chips, agrupados por departamento. Con los dos departamentos
          activos, antes salían todos en una sola fila —una vitamina justo al
          lado de una laptop—, que es exactamente lo revuelto que Angel quiso
          evitar al partir la tienda en dos. Con uno solo activo (el otro
          todavía sin productos), se ve igual que antes: una fila simple, sin
          etiqueta de más. */}
      {categoriasPorDepartamento.map(({ department, items }) => (
        <section key={department} className="mt-10">
          {categoriasPorDepartamento.length > 1 && (
            <div className="mb-3 flex items-center gap-2 text-[12px] font-bold tracking-[.06em] text-vt-muted-2 uppercase">
              <Icon name={DEPARTMENTS[department].icon} className="h-3.5 w-3.5" />
              {DEPARTMENTS[department].label}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {items.map((c) => (
              <Link
                key={c.id}
                href={`/catalogo?dept=${DEPARTMENTS[department].slug}&cat=${encodeURIComponent(c.name)}`}
                className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[.03] px-4 py-2.5 hover:border-vt-accent/50"
              >
                <span className="text-vt-muted-1 group-hover:text-vt-accent">
                  <Icon name={resolveCategoryIcon(c.name)} className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[13.5px] font-bold text-vt-fg">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Una fila de destacados por departamento. Con un solo departamento con
          productos, el título vuelve a ser simplemente "Destacados". */}
      {destacadosPorDepartamento.map(({ department, productos }) => {
        const info = DEPARTMENTS[department];
        const unicoDepartamento = destacadosPorDepartamento.length === 1;
        return (
          <section key={department} className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div className="font-heading flex items-center gap-2.5 text-[28px] font-bold text-white">
                {!unicoDepartamento && (
                  <span className="text-vt-accent">
                    <Icon name={info.icon} className="h-6 w-6" />
                  </span>
                )}
                {unicoDepartamento ? "Destacados" : info.label}
                <span className="text-vt-accent">.</span>
              </div>
              <Link
                href={`/catalogo?dept=${info.slug}`}
                className="flex-none text-[13px] font-bold text-vt-accent"
              >
                Ver todo ›
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[880px]:grid-cols-4">
              {productos.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
