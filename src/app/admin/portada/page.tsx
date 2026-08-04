import { prisma } from "@/lib/prisma";
import { getSiteSettings, resolveHeroContent } from "@/lib/site-settings";
import { getHeroSlides } from "@/lib/hero-slides";
import { HeroContentForm } from "@/components/admin/HeroContentForm";
import { HeroSlidesManager } from "@/components/admin/HeroSlidesManager";

export default async function AdminHeroPage() {
  const [settings, slides, productos, categorias] = await Promise.all([
    getSiteSettings(),
    getHeroSlides(),
    // Solo los visibles: no tiene sentido ofrecer como destino un producto que
    // el cliente no puede ver — el enlace lo llevaría a una página 404.
    prisma.product.findMany({
      where: { visible: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  const content = resolveHeroContent(settings);

  const destinos = {
    productos: productos.map((p) => ({ valor: `/producto/${p.id}`, etiqueta: p.name })),
    categorias: categorias.map((c) => ({
      valor: `/catalogo?cat=${encodeURIComponent(c.name)}`,
      etiqueta: c.name,
    })),
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white">Portada</h1>
      <p className="mt-2 max-w-xl text-[13.5px] text-vt-muted-1">
        Lo que se ve arriba del todo en la home: los textos y el carrusel de diseños. Los cambios se
        aplican de inmediato.
      </p>

      <div className="mt-8 max-w-2xl">
        <h2 className="font-heading text-lg font-bold text-white">Textos</h2>
        <p className="mt-1 mb-4 text-[13px] text-vt-muted-1">
          Cámbialos para anunciar una temporada, una promoción o un descuento.
        </p>
        <HeroContentForm content={content} />
      </div>

      <div className="mt-12 max-w-3xl">
        <h2 className="font-heading text-lg font-bold text-white">Carrusel de diseños</h2>
        <p className="mt-1 mb-4 text-[13px] text-vt-muted-1">
          Las imágenes grandes debajo del texto. Si subes varias, van rotando solas cada 6 segundos
          y el cliente puede pasarlas con las flechas. Usa ↑ ↓ para cambiar el orden: la primera es
          la que se ve al entrar. En &quot;A dónde lleva&quot; eliges si la imagen es clicable y a
          qué producto o categoría manda al cliente.
        </p>
        <HeroSlidesManager slides={slides} destinos={destinos} />
      </div>
    </div>
  );
}
