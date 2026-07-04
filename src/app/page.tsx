import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

const CATEGORY_ICONS: Record<string, string> = {
  Laptops: "💻",
  Celulares: "📱",
  Monitores: "🖥️",
  Audio: "🎧",
  Accesorios: "⌨️",
  Impresoras: "🖨️",
};

const BENEFITS = [
  { icon: "🚚", title: "Envío a todo el país", sub: "Gratis desde Q 299" },
  { icon: "🏪", title: "Recoge en tienda", sub: "Listo en 2 horas" },
  { icon: "🛡️", title: "Garantía real", sub: "Servicio técnico propio" },
  { icon: "💳", title: "Pago seguro", sub: "Tarjeta o contra entrega" },
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(4)]);

  return (
    <div className="animate-vt-fade mx-auto max-w-[1180px] px-6 py-10">
      {/* Hero */}
      <section className="relative grid grid-cols-1 gap-10 overflow-hidden rounded-3xl border border-white/10 p-10 min-[880px]:grid-cols-[1.1fr_1fr]">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(163,230,53,.2), transparent 65%)" }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-vt-accent/30 bg-vt-accent/[.12] px-3.5 py-1.5 text-[12px] font-bold tracking-[.05em] text-vt-accent">
            TEMPORADA TECH · HASTA -40%
          </span>
          <h1 className="font-heading my-4 text-[38px] leading-[1.08] font-bold text-white min-[880px]:text-[50px]">
            Potencia tu setup al mejor <span className="text-vt-accent">precio</span>
          </h1>
          <p className="max-w-[440px] text-[15px] text-vt-muted-1">
            Tecnología de las mejores marcas, con envío a todo Guatemala y garantía real. Encuentra
            laptops, celulares, monitores y más al mejor precio.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="rounded-[10px] bg-vt-accent px-7 py-3.5 text-sm font-bold text-vt-accent-fg"
            >
              Ver ofertas
            </Link>
            <Link
              href="/catalogo"
              className="rounded-[10px] border border-white/25 px-7 py-3.5 text-sm font-bold text-white hover:border-vt-accent hover:text-vt-accent"
            >
              Explorar catálogo
            </Link>
          </div>
        </div>
        <div className="relative grid h-[340px] place-items-center rounded-2xl bg-white/[.05] text-7xl">
          💻
        </div>
      </section>

      {/* Benefits */}
      <section className="mt-14 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[880px]:grid-cols-4">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"
          >
            <span className="text-2xl">{b.icon}</span>
            <div>
              <div className="text-[13.5px] font-bold text-white">{b.title}</div>
              <div className="text-[11.5px] text-vt-muted-2">{b.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Category chips */}
      <section className="mt-10 flex flex-wrap gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/catalogo?cat=${encodeURIComponent(c.name)}`}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-4 py-2.5 hover:border-vt-accent/50"
          >
            <span className="text-xl">{CATEGORY_ICONS[c.name] ?? "🔧"}</span>
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
