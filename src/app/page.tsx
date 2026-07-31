import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Icon, type IconName } from "@/components/Icon";
import { resolveCategoryIcon } from "@/lib/product-icon";
import { getSiteSettings, resolveHeroContent } from "@/lib/site-settings";
import { getHeroSlides } from "@/lib/hero-slides";
import { HeroCarousel } from "@/components/HeroCarousel";
import { VitoMascot } from "@/components/Logo";

const BENEFITS: { icon: IconName; title: string; sub: string }[] = [
  { icon: "truck", title: "Envío a todo el país", sub: "Gratis desde Q 299" },
  { icon: "store", title: "Recoge en tienda", sub: "Listo en 2 horas" },
  { icon: "shield", title: "Garantía real", sub: "Servicio técnico propio" },
  { icon: "card", title: "Pago seguro", sub: "Tarjeta o contra entrega" },
];

export default async function HomePage() {
  const [categories, featured, settings, slides] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getSiteSettings(),
    getHeroSlides(),
  ]);
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
          <p className="mt-2 max-w-[560px] text-[14.5px] leading-relaxed text-vt-muted-1">
            Te acompaño en Importadora Vitatech. Traemos tecnología original de las mejores marcas,
            con garantía real, servicio técnico propio y envío a todo Guatemala.
          </p>
        </div>
      </section>

      {/* Category chips */}
      <section className="mt-10 flex flex-wrap gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/catalogo?cat=${encodeURIComponent(c.name)}`}
            className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[.03] px-4 py-2.5 hover:border-vt-accent/50"
          >
            <span className="text-vt-muted-1 group-hover:text-vt-accent">
              <Icon name={resolveCategoryIcon(c.name)} className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[13.5px] font-bold text-vt-fg">{c.name}</span>
          </Link>
        ))}
      </section>

      {/* Featured */}
      <section className="mt-14">
        <div className="flex items-end justify-between">
          <div className="font-heading text-[28px] font-bold text-white">
            Destacados<span className="text-vt-accent">.</span>
          </div>
          <Link href="/catalogo" className="text-[13px] font-bold text-vt-accent">
            Ver catálogo ›
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[880px]:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
